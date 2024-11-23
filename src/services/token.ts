import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: "15m", 
  });
};

export const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: "7d", 
  });
};

export const generateInvitationToken = (data: { workspaceId: string; email: string }) => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(data, secret, { expiresIn: '48h' }); 
};

export const verifyInviteToken = (token:string)=>{
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { workspaceId: string, email: string ,exp: number};
  const { workspaceId, email,exp } = decoded;
  return { workspaceId, email,exp } 
}