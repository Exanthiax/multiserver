import type { IpcMainInvokeEvent } from "electron";
import log from "electron-log";

import https from "https";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";

import { getMainWindow } from "#index";
import { resourcesPath } from "#lib/constants";
import { fixLog4j, getJarURL, sanitizedDirName } from "#instances/common";
import { getSettings } from "#lib/settings";
import type { InstanceOptions } from "#types";

/**
 * Creates a new Minecraft server instance (vanilla or paper)
 *
 * @param opts options for the instance
 */
export async function createInstance(
    _event: IpcMainInvokeEvent,
    opts: InstanceOptions
): Promise<boolean> {
    try {
        const sanitizedName = sanitizedDirName(opts.name);
        const instancesPath = getSettings().instancePath;

        if (sanitizedName === "") {
            log.error(`Invalid instance name ${opts.name}`);
            throw new Error(`Invalid instance name ${opts.name}`);
        }

        const instanceRoot = path.join(instancesPath, sanitizedName);

        log.info(`Creating directory for ${opts.type} server instance ${opts.name}`);
        await fs.mkdir(instanceRoot, { recursive: true });

        // Write configuration file
        log.debug("Writing configuration file");
        await fs.writeFile(
            path.join(instanceRoot, "multiserver.config.json"),
            JSON.stringify(opts, undefined, 4)
        );

        // Accept EULA
        log.debug("Writing eula.txt");
        await fs.writeFile(path.join(instanceRoot, "eula.txt"), "eula=true");

        // Copy server.properties template
        log.debug("Writing server.properties using 1.19 template");
        const serverPropsPath = path.join(instanceRoot, "server.properties");
        await fs.copyFile(path.join(resourcesPath, "server.properties"), serverPropsPath);

        // Enable RCON by default
        try {
            let props = await fs.readFile(serverPropsPath, "utf8");

            const updates: Record<string, string> = {
                "enable-rcon": "true",
                "rcon.password": "multiserver",
                "rcon.port": "25575"
            };

            for (const key in updates) {
                const regex = new RegExp(`^${key}=.*$`, "m");
                if (regex.test(props)) {
                    props = props.replace(regex, `${key}=${updates[key]}`);
                } else {
                    props += `\n${key}=${updates[key]}`;
                }
            }

            await fs.writeFile(serverPropsPath, props, "utf8");
            log.debug("RCON enabled with default settings");
        } catch (err) {
            log.error("Failed to enable RCON by default:", err);
        }

        // Download server jar (vanilla or paper only)
        log.info(`Downloading ${opts.type} - ${opts.version} server jar`);
        const jarURL = await getJarURL(opts.type, opts.version);

        log.debug(`Server JAR url: ${jarURL}`);
        await new Promise<void>((resolve, reject) => {
            const stream = createWriteStream(path.join(instanceRoot, "server.jar"));
            https.get(jarURL, (res) => {
                res.pipe(stream);
                stream.on("finish", () => {
                    stream.close();
                    resolve();
                });
            }).on("error", reject);
        });

        // Apply Log4j fix if needed
        await fixLog4j(opts, instanceRoot);

        log.info("Server creation complete");
        return true;
    } catch (e) {
        log.error(e);
        return false;
    } finally {
        // Refresh main window
        setTimeout(() => getMainWindow().reload(), 500);
    }
}
