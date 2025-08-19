import express from "express";
import { protectRoute, protectRole } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  removeFriend,
  getFriendRequestsCount,
  getMyChildren,
  linkChildToParent,
  getChildConversations,
  generateLinkCode,
  useLinkCode,
  getLinkedAccounts,
} from "../controllers/user.controller.js";
import {
  validateFriendRequest,
  validateAcceptFriendRequest,
  validateLinkChild,
  validateGenerateLinkCode,
  validateUseLinkCode,
  validateChildConversations,
  validateObjectId,
} from "../middleware/validation.middleware.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", validateFriendRequest, sendFriendRequest);
router.put("/friend-request/:id/accept", validateAcceptFriendRequest, acceptFriendRequest);
router.delete("/friends/:id", validateObjectId, removeFriend);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/friend-requests/count", getFriendRequestsCount);

// Parent-child relationship routes (parents only)
router.get("/children", protectRole(["parent"]), getMyChildren);
router.post("/link-child", protectRole(["parent"]), validateLinkChild, linkChildToParent);
router.get("/children/:childId/conversations", protectRole(["parent"]), validateChildConversations, getChildConversations);

// Secure linking system routes
router.post("/generate-link-code", protectRole(["parent"]), validateGenerateLinkCode, generateLinkCode);
router.post("/use-link-code", protectRole(["student"]), validateUseLinkCode, useLinkCode);
router.get("/linked-accounts", getLinkedAccounts);

export default router;
