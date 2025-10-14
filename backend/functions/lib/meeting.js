"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("./firebase");
const client_1 = require("./client");
const router = (0, express_1.Router)();
// ==================== Meeting Collection Operations ====================
// 这个模块处理所有会议集合的操作，不涉及特定会议ID的操作
/**
 * 获取所有会议列表
 * GET /meetings
 */
router.get("/", async (req, res) => {
    try {
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 获取用户参与的会议
        const meetings = await (0, client_1.getUserMeetings)(uid);
        res.json({ success: true, data: meetings });
    }
    catch (error) {
        if (error instanceof Error &&
            (error.message === "未提供认证令牌" || error.message === "无效的认证令牌")) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error("获取会议列表失败:", error);
        res.status(500).json({ success: false, error: "获取会议列表失败" });
    }
});
/**
 * 创建新会议
 * POST /meetings
 */
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        const userDoc = await firebase_1.db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        const meetingData = {
            title,
            time: "",
            participants: [
                { id: uid, name: (userData === null || userData === void 0 ? void 0 : userData.name) || "", avatar: (userData === null || userData === void 0 ? void 0 : userData.avatar) || "" },
            ], // 临时用户对象，后续会从数据库获取完整信息
            votelink: "",
            createdBy: uid,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const meetingRef = await firebase_1.db.collection("meetings").add(meetingData);
        res.json({
            success: true,
            data: Object.assign({ meetingid: meetingRef.id }, meetingData),
        });
    }
    catch (error) {
        if (error instanceof Error &&
            (error.message === "未提供认证令牌" || error.message === "无效的认证令牌")) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error("创建会议失败:", error);
        res.status(500).json({ success: false, error: "创建会议失败" });
    }
});
exports.default = router;
//# sourceMappingURL=meeting.js.map