import { bigquery } from "../config/gcp";
import logger from "../utils/logger.utils";

export class AnalyticsService {
  //private dataset = bigquery.dataset("wecareehr_analytics");

  private dataset = bigquery ? bigquery.dataset("wecareehr_analytics") : null;

  async recordPatientVisit(data: {
    patientId: string;
    clinicId: string;
    diagnosis: string;
    amount: number;
  }): Promise<void> {
    if (!this.dataset) throw new Error("BigQuery client is not initialized");

    try {
      const table = this.dataset.table("patient_visits");
      await table.insert([
        {
          patient_id: data.patientId,
          clinic_id: data.clinicId,
          visit_date: new Date().toISOString(),
          diagnosis: data.diagnosis,
          amount: data.amount,
        },
      ]);
      logger.info("Patient visit recorded in BigQuery");
    } catch (error) {
      logger.error("Failed to record patient visit:", error);
    }
  }

  async getDailyRevenue(clinicId: string, date: string) {
    if (!bigquery) throw new Error("BigQuery client is not initialized");

    try {
      const query = `
        SELECT 
          DATE(visit_date) as date,
          SUM(amount) as total_revenue,
          COUNT(DISTINCT patient_id) as patient_count
        FROM \`wecareehr_analytics.patient_visits\`
        WHERE clinic_id = @clinicId
        AND DATE(visit_date) = @date
        GROUP BY date
      `;

      const [rows] = await bigquery.query({
        query,
        params: { clinicId, date },
      });

      return rows[0] || { total_revenue: 0, patient_count: 0 };
    } catch (error) {
      logger.error("Failed to get daily revenue:", error);
      throw error;
    }
  }

  async getMonthlyTrends(clinicId: string) {
    if (!bigquery) throw new Error("BigQuery client is not initialized");

    try {
      const query = `
        SELECT 
          DATE_TRUNC(DATE(visit_date), MONTH) as month,
          COUNT(DISTINCT patient_id) as patient_count,
          SUM(amount) as revenue,
          AVG(amount) as avg_visit_value
        FROM \`wecareehr_analytics.patient_visits\`
        WHERE clinic_id = @clinicId
        AND visit_date >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month DESC
      `;

      const [rows] = await bigquery.query({
        query,
        params: { clinicId },
      });

      return rows;
    } catch (error) {
      logger.error("Failed to get monthly trends:", error);
      throw error;
    }
  }

  async recordVitalsTrend(patientId: string, vitals: any): Promise<void> {
    if (!this.dataset) throw new Error("BigQuery client is not initialized");

    try {
      const table = this.dataset.table("vitals_trends");
      const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);

      await table.insert([
        {
          patient_id: patientId,
          recorded_at: new Date().toISOString(),
          bp_systolic: systolic,
          bp_diastolic: diastolic,
          temperature: vitals.temperature,
        },
      ]);
      logger.info("Vitals trend recorded in BigQuery");
    } catch (error) {
      logger.error("Failed to record vitals trend:", error);
    }
  }
}
