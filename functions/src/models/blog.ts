import {db} from "../plugins/firestore";

/**
 *ブログのLGTMデータの保存
 * @param {string} id
 * @return {unknown}
 */
export const postBlogLgtm = async (id: string): Promise<unknown> => {
  const blogRef = db.collection("blog_lgtm").doc(id);
  const res = await blogRef.set({
    good: 0,
    bad: 0,
  }, {merge: true});
  return res;
};

/**
 *ブログのアーカイブ情報の保存
 * @param {string} created_at
 * @param {string} tag
 * @param {number} monthly_count
 * @param {number} tag_count
 * @param {number} tag_percent
 * @return {unknown}
 */
export const putBlogArchive = async (created_at: string, tag: string, monthly_count: number, tag_count: number, tag_percent: number): Promise<boolean | unknown> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // 月別アーカイブ
    const monthlyRef = archiveRef.collection("monthly").doc(created_at);
    await monthlyRef.set({
      count: monthly_count,
    }, {merge: true});
    // タグ別アーカイブ
    const tagRef = archiveRef.collection("tag").doc(tag);
    await tagRef.set({
      count: tag_count,
      percent: tag_percent,
    }, {merge: true});
    return true;
  } catch (err) {
    return err;
  }
};

/**
 *ブログの月別アーカイブ情報の取得
 * @param {string} created_at
 * @return {unknown}
 */
export const getMonthlyArchive = async (created_at: string): Promise<null | Record<string, number>> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // 月別アーカイブ
    const monthlyRef = archiveRef.collection("monthly").doc(created_at);
    const doc = await monthlyRef.get();
    if (!doc.exists) {
      return null;
    } else {
      return doc.data() as unknown as Record<string, number>;
    }
  } catch (err) {
    return null;
  }
};

/**
 *ブログのタグ別アーカイブ情報の取得
 * @param {string} tag
 * @return {unknown}
 */
export const getTagArchive = async (tag: string): Promise<null | Record<string, number>> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // 月別アーカイブ
    const tagRef = archiveRef.collection("tag").doc(tag);
    const doc = await tagRef.get();
    if (!doc.exists) {
      return null;
    } else {
      return doc.data() as unknown as Record<string, number>;
    }
  } catch (err) {
    return null;
  }
};