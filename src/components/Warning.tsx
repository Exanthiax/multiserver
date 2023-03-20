import { Info, Warning as Warn } from "@mui/icons-material";

interface WarningProps {
    content: string;
    type: "warn" | "error";
}

const Warning = ({ content, type }: WarningProps) => {
    function get<T>(warn: T, error: T): T {
        return type === "warn" ? warn : error;
    }

    return (
        <section
            className={`${get("border-yellow-500", "border-red-500")} ${get(
                "bg-yellow-300",
                "bg-red-300"
            )} border-0 border-l-2 p-3 m-4 text-white dark:text-black`}
        >
            {get(<Info />, <Warn />)} {content}
        </section>
    );
};

export default Warning;
