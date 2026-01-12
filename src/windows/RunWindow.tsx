import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

import Repl from "#components/Repl";
import { render } from "#lib/render";
import type { InstanceInfo } from "#types";
import "#app.global.css";

interface ServerOutput {
    type: "stdout" | "stderr";
    content: string;
}

const RunWindow = (): JSX.Element => {
    const [info, setInfo] = useState<InstanceInfo | null>(null);
    const [output, setOutput] = useState<ServerOutput[]>([]);

    const log = useRef<HTMLPreElement>(null);

    useEffect(() => {
        server.onInfo(setInfo);

        server.onStdout((out) =>
            setOutput((s) => [...s, { type: "stdout", content: out }])
        );
        server.onStderr((err) =>
            setOutput((s) => [...s, { type: "stderr", content: err }])
        );
    }, []);

    useEffect(() => {
        if (log.current) log.current.scrollTop = log.current.scrollHeight;
    });

    return (
        <>
            <Helmet>
                <title>{`Running server ${info?.info.name ?? ""}`}</title>
            </Helmet>

            <div
                className="grid grid-cols-3 grid-rows-2 gap-6 w-full h-full max-h-screen"
                style={{ maxWidth: "100vw" }}
            >
                {/* Players section removed */}

                <div className="col-span-3 max-h-full">
                    <h3>Log</h3>
                    <pre
                        ref={log}
                        className="p-2 overflow-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-rounded scrollbar-thumb-blue-700"
                        style={{ maxHeight: "calc(100% - 1.5rem)" }}
                    >
                        {output.map((o) => (
                            <div
                                key={o.content}
                                className={
                                    o.type === "stderr" ? "text-red-600" : ""
                                }
                            >
                                {o.content}
                            </div>
                        ))}
                    </pre>
                </div>

                <div
                    className="col-span-3"
                    style={{ maxHeight: "calc(100% - 1.5rem)" }}
                >
                    <Repl
                        className="max-h-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-rounded scrollbar-thumb-blue-700"
                        prompt={`${
                            info?.info.name.replace(/\s+/g, "-") ?? ""
                        }>`}
                        exec={server.rcon}
                    />
                </div>
            </div>
        </>
    );
};

render(RunWindow);