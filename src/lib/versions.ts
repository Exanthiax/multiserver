import cmp from "semver-compare";

export function getServerTypes(): string[] {
    return ["vanilla", "paper", "purpur", "fabric"];
}

export async function getVersions(type: string): Promise<string[]> {
    if (["fabric", "vanilla"].includes(type)) {
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

        if (type === "fabric")
            return (
                data
                    .filter(
                        (v) =>
                            v.type === "release" &&
                            Number(v.id.split(".")[1]) >= 14
)
.map((v) => v.id)
                    .sort(cmp)
                    .reverse()
            );
        else
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
    } else if (type === "purpur") {
        const res = await fetch("https://api.purpurmc.org/v2/projects/purpur");
        const data = (await res.json()) as {
            project_id: string;
            project_name: string;
            versions: string[];
        };

        return data.versions
            .filter((v) => !/[a-z]/gi.test(v)) // optional: filter out pre-releases if any
            .sort(cmp)
            .reverse();
    }

    return [] as string[];
}
