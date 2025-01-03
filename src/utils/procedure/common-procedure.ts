import { db } from "../../app/database";

const callSingleParamStoredProcedure = async (
  procedureName: string,
  id: number
) => {
  try {
    const result = await db.raw(`CALL ${procedureName}(?)`, [id]);

    return result[0][0];
  } catch (error) {
    throw error;
  }
};
const callProductStoredProcedure = async (
  procedureName: string,
  product_id: number,
  v_id: number,
  p_color_id: number,
  size_id: number
) => {
  try {
    const result = await db.raw(`CALL ${procedureName}(?, ?, ?, ?)`, [
      product_id,
      size_id,
      v_id,
      p_color_id,
    ]);

    return result[0][0][0];
  } catch (error) {
    throw error;
  }
};

export { callProductStoredProcedure, callSingleParamStoredProcedure };
