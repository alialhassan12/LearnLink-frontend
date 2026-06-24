import {create} from "zustand";
import type { SessionReview } from "../@types/sessionReview";

interface ReviewsStoreState{
    sessionReview:SessionReview;
}