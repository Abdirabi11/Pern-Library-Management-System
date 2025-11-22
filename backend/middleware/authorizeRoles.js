
export const authorizeRoles= (...roles)=>{
    return (req, res, next)=>{
        const userRole = req.user.role;
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        if(!roles.includes(userRole)){
            return res.status(403).json({
                success: false,
                message: "Access denied: insufficient permissions"
            })
        }
        next();
    }
}