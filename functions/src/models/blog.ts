import {db} from "../plugins/firestore";
import {BlogLgtmType, BlogLgtm} from "../types/interface";
import admin from "firebase-admin";

/**
 *ブログのLGTMデータの保存
 * @param {string} id
 * @return {unknown}
 */
export const postBlogLgtm = async (id: string): Promise<unknown> => {
  const blogRef = db.collection("blog_lgtm").doc(id);
  const res = await blogRef.set(
      {
        good: 0,
        bad: 0,
      },
      {merge: true}
  );
  return res;
};

/**
 *ブログのアーカイブ情報の保存
 * @param {string} created_at
 * @param {string} tag
 * @param {number} monthly_count
 * @param {number} tag_count
 * @param {number} tag_order
 * @param {number} tag_percent
 * @return {unknown}
 */
export const putBlogArchive = async (
    created_at: string,
    tag: string,
    monthly_count: number,
    tag_count: number,
    tag_order: number,
    tag_percent: number
): Promise<boolean | unknown> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // 月別アーカイブ
    const monthlyRef = archiveRef.collection("monthly").doc(created_at);
    await monthlyRef.set(
        {
          count: monthly_count,
        },
        {merge: true}
    );
    // タグ別アーカイブ
    const tagRef = archiveRef.collection("tag").doc(tag);
    await tagRef.set(
        {
          count: tag_count,
          percent: tag_percent,
          order: tag_order,
        },
        {merge: true}
    );
    return true;
  } catch (err) {
    return err;
  }
};

/**
 *ブログのシリーズ情報の保存
 * @param {string} tag
 * @param {string} series
 * @return {unknown}
 */
export const putBlogSeries = async (
    tag: string,
    series: string
): Promise<boolean | unknown> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // タグ別アーカイブの取得
    const tagArchives = await getTagArchive(tag);
    if (tagArchives) {
      const tagRef = archiveRef.collection("tag").doc(tag);
      let seriesArr: string[] = [];
      if (tagArchives.series) {
        // すでにデータがあれば何もしない
        if ((tagArchives.series as string[]).find((v) => v === series)) {
          return true;
        }
        seriesArr = (tagArchives.series as string[]).slice();
        seriesArr.push(series);
      } else {
        seriesArr.push(series);
      }
      await tagRef.set(
          {
            ...tagArchives,
            series: seriesArr,
          },
          {merge: true}
      );
      return true;
    }
    return false;
  } catch (err) {
    return err;
  }
};

/**
 *ブログのシリーズ情報の削除
 * @param {string} series
 * @return {unknown}
 */
export const deleteBlogSeries = async (
    series: string
): Promise<boolean | unknown> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // タグ別アーカイブの取得
    // const tagArchives = await getTagArchive(tag);
    const tagCollection = await archiveRef
        .collection("tag")
        .where("series", "array-contains", series)
        .get();
    if (tagCollection) {
      tagCollection.forEach(async (doc) => {
        console.log(doc.id, " => ", JSON.stringify(doc.data()));
        const tagData = doc.data();
        let seriesArr: string[] = [];
        if (tagData.series) {
          // 一致するデータがなければ何もしない
          if (!(tagData.series as string[]).find((v) => v === series)) {
            return true;
          }
          seriesArr = (tagData.series as string[]).filter((v) => v !== series);
        }
        const tagRef = archiveRef.collection("tag").doc(doc.id);
        await tagRef.set(
            {
              ...tagData,
              series: seriesArr,
            },
            {merge: true}
        );
        return;
      });
      return true;
    }
    return false;
  } catch (err) {
    return err;
  }
};

/**
 *ブログの月別アーカイブ情報の取得
 * @param {string} created_at
 * @return {unknown}
 */
export const getMonthlyArchive = async (
    created_at: string
): Promise<null | Record<string, number>> => {
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
 * 全てのブログの月別アーカイブ情報の取得
 * @return {unknown}
 */
export const getMonthlyArchives = async (): Promise<
  Record<string, number>[]
> => {
  try {
    const docRef = db.collection("blog").doc("archive");
    const monthlyRef = docRef.collection("monthly");
    const snapshot = await monthlyRef.get();
    if (snapshot.empty) {
      return [];
    }
    const arr: Record<string, number>[] = [];
    snapshot.forEach((doc) => {
      if (doc.exists) {
        arr.push({
          [doc.id]: doc.data() as unknown as number,
        });
      }
    });
    return arr.reverse();
  } catch (err) {
    return [];
  }
};

/**
 *ブログのタグ別アーカイブ情報の取得
 * @param {string} tag
 * @return {unknown}
 */
export const getTagArchive = async (
    tag: string
): Promise<null | Record<string, number | string[]>> => {
  try {
    const archiveRef = db.collection("blog").doc("archive");
    // タグ別アーカイブ
    const tagRef = archiveRef.collection("tag").doc(tag);
    const doc = await tagRef.get();
    if (!doc.exists) {
      return null;
    } else {
      return doc.data() as unknown as Record<string, number | string[]>;
    }
  } catch (err) {
    return null;
  }
};

/**
 * 全てのブログの月別アーカイブ情報の取得
 * @return {unknown}
 */
export const getTagArchives = async (): Promise<
  Record<string, number | string[]>[]
> => {
  try {
    const docRef = db.collection("blog").doc("archive");
    const tagRef = docRef.collection("tag");
    const snapshot = await tagRef.orderBy("order").get();
    if (snapshot.empty) {
      return [];
    }
    const arr: Record<string, number | string[]>[] = [];
    snapshot.forEach((doc) => {
      if (doc.exists) {
        arr.push({
          [doc.id]: doc.data() as unknown as number | string[],
        });
      }
    });
    return arr;
  } catch (err) {
    return [];
  }
};

/**
 *ブログのLGTMの取得
 * @param {string} id
 * @return {unknown}
 */
export const getBlogLgtm = async (id: string): Promise<null | BlogLgtm> => {
  try {
    const docRef = db.collection("blog_lgtm").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    } else {
      return doc.data() as unknown as BlogLgtm;
    }
  } catch (err) {
    return null;
  }
};

/**
 *ブログのLGTMの取得
 * @param {string} id
 * @param {BlogLgtmType} type
 * @param {number} value
 * @return {unknown}
 */
export const putBlogLgtm = async (
    id: string,
    type: BlogLgtmType,
    value: number
): Promise<unknown> => {
  try {
    const docRef = db.collection("blog_lgtm").doc(id);
    let res;
    switch (type) {
      case "good":
        res = docRef.update({
          good: admin.firestore.FieldValue.increment(value),
        });
        break;
      case "bad":
        res = docRef.update({
          bad: admin.firestore.FieldValue.increment(value),
        });
        break;
      default:
        break;
    }
    return res;
  } catch (err) {
    return null;
  }
};
