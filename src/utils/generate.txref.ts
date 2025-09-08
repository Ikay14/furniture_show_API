import { uuid } from "short-uuid";

export const generateTxRef = (): string => {
    return `Tx-${uuid()}-${Date.now()}`;
};
