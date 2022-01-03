import { WebSocket } from "ws";

export class WsUtils {
    public static sendProgress(ws: WebSocket, msg: string, percentage: number) {
        ws.send(JSON.stringify({type: 'progress', msg, percentage}));
    }
}