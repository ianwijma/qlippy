import {startupArguments} from "./startupArguments";
import {isDev} from "./isDev";

export const isDebug = () => isDev()  || startupArguments.debug