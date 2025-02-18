import {protocol} from 'electron'
import {ensureSafeFilePath, readFile} from "./files";

export const fileProtocol = (() => {
    const protocolName = "app";

    protocol.registerSchemesAsPrivileged([
        { scheme: protocolName, privileges: { bypassCSP: true } },
    ]);

    return {
        initialize: async () => {
            protocol.handle(protocolName, async (request) => {
                try {
                    const { pathname } = new URL(request.url);

                    ensureSafeFilePath(pathname);

                    return new Response(await readFile(pathname));
                } catch (error) {
                    // Handle the error as needed
                    console.error(error);
                }
            });
        }
    }
})();