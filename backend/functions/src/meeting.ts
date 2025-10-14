import { Router, Request, Response } from "express";
import { db } from "./firebase";
import { verifyAuth, getUserMeetings } from "./client";
import { Meeting, CreateMeetingRequest } from "./types";

const router = Router();

// ==================== Meeting Collection Operations ====================
// 这个模块处理所有会议集合的操作，不涉及特定会议ID的操作

/**
 * 获取所有会议列表
 * GET /meetings
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req); // 验证认证令牌

    // 获取用户参与的会议
    const meetings: Meeting[] = await getUserMeetings(uid);

    res.json({ success: true, data: meetings });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "未提供认证令牌" || error.message === "无效的认证令牌")
    ) {
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
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title }: CreateMeetingRequest = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    const meetingData: Omit<Meeting, "meetingid"> = {
      title,
      time: "",
      participants: [
        { id: uid, name: userData?.name || "", avatar: userData?.avatar || "" },
      ], // 临时用户对象，后续会从数据库获取完整信息
      votelink: "",
      createdBy: uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const meetingRef = await db.collection("meetings").add(meetingData);

    res.json({
      success: true,
      data: {
        meetingid: meetingRef.id,
        ...meetingData,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "未提供认证令牌" || error.message === "无效的认证令牌")
    ) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error("创建会议失败:", error);
    res.status(500).json({ success: false, error: "创建会议失败" });
  }
});

export default router;
