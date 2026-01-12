import cmp from "semver-compare";

export function getServerTypes(): string[] {
    return ["vanilla", "paper"];
}

export async function getVersions(type: string): Promise<string[]> {
    if (type === "vanilla") {
        const res = await fetch(
            "https://launchermeta.mojang.com/mc/game/version_manifest.json"
        );

        const data = (
            (await res.json()) as {
                versions: {
                    id: string;
                    type: "snapshot" | "release";
                    url: string;
                    time: string;
                    releaseTime: string;
                }[];
            }
        ).versions;

        return data
            .filter((v) => v.type === "release")
            .map((v) => v.id)
            .sort(cmp)
            .reverse();

    } else if (type === "paper") {
        const res = await fetch("https://papermc.io/api/v2/projects/paper");
        const data = (await res.json()) as {
            project_id: string;
            project_name: string;
            version_groups: string[];
            versions: string[];
        };

        return data.versions
            .filter((v) => !/[a-z]/gi.test(v)) // filter out pre-releases
            .sort(cmp)
            .reverse();
    }

    return [];
}
