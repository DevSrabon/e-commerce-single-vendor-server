import { db } from '../../app/database';

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

export { callSingleParamStoredProcedure };
