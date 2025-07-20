export type loginResponseType = {
    accessToken: string;
    role: string;
}

export type jwtPayloadType = {
    id: number;
    email: string;
    role: string;
}