export declare const db: FirebaseFirestore.Firestore;
export declare const auth: import("firebase-admin/auth").Auth;
export declare const COLLECTIONS: {
    readonly USERS: "users";
    readonly MEETINGS: "meetings";
    readonly PRE_MEETING: "preMeeting";
    readonly IN_MEETING: "inMeeting";
    readonly POST_MEETING: "postMeeting";
};
export declare const FIRESTORE_INDEXES: {
    meetings: {
        collectionGroup: string;
        queryScope: string;
        fields: {
            fieldPath: string;
            order: string;
        }[];
    }[];
};
//# sourceMappingURL=firebase.d.ts.map