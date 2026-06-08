interface PlanFeatures{
    max_courses:number;
    sessions_per_month:number;
    ai_tokens_per_month:number;
    search_priority:boolean
    [key:string]:any
}

export interface Plan{
    id?:number;
    title:string;
    description:string;
    type:string;
    features:PlanFeatures;
    duration_days:number;
    price:number;
    is_free:boolean;
    status:string;
    created_at?:string;
    updated_at?:string;
}