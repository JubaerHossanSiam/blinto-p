import { db, databaseConfigured } from '@/lib/db';
export type OfficialMonthlyResult={monthKey:string;clickUpScore:number|null;managerScore:number|null;finalScore:number|null;status:'pending'|'complete'|'incomplete';generatedAt:string|null};
export async function getOfficialMonthlyResults(employeeSlug:string):Promise<OfficialMonthlyResult[]>{
 if(!databaseConfigured)return [];
 const r=await db.query(`select month_key,clickup_score,manager_score,final_score,status,generated_at from monthly_performance_results where employee_slug=$1 order by month_key desc`,[employeeSlug]);
 return r.rows.map(row=>({monthKey:row.month_key,clickUpScore:row.clickup_score===null?null:Number(row.clickup_score),managerScore:row.manager_score===null?null:Number(row.manager_score),finalScore:row.final_score===null?null:Number(row.final_score),status:row.status,generatedAt:row.generated_at?.toISOString?.()??String(row.generated_at)}));
}