import { CreateFeedbackModal } from "@/components/Feedback/CreateFeedbackModal";
import { FeedbackList } from "@/components/Feedback/FeedbackList";

export default function FeedbackPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl">
            <span className="font-light">Issues &</span>{" "}
            <span className="font-semibold italic">Votes</span>
          </h1>
          <p className="text-muted-foreground">
            Democratic living. Report issues or vote on house proposals.
          </p>
        </div>
        <CreateFeedbackModal />
      </div>

      <FeedbackList />
    </div>
  );
}
