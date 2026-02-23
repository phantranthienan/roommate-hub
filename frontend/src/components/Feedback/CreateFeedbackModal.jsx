import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { useCreateFeedback } from "@/hooks/useFeedback";
import { useMembers } from "@/hooks/useMembers";

const FEEDBACK_TYPES = [
  { value: "issue", label: "Issue" },
  { value: "suggestion", label: "Suggestion" },
];

export function CreateFeedbackModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("issue");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const createFeedback = useCreateFeedback();
  const { data: members = [] } = useMembers();
  const canPostAnonymously = members.length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createFeedback.mutateAsync({
      type,
      title,
      description: description || undefined,
      isAnonymous: canPostAnonymously && isAnonymous,
    });
    setType("issue");
    setTitle("");
    setDescription("");
    setIsAnonymous(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Feedback</DialogTitle>
          <DialogDescription>
            Report an issue or suggest an improvement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Broken Toaster"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">Description</Label>
              <Textarea
                id="description"
                placeholder="Details..."
                className="col-span-3 min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {canPostAnonymously && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="anonymous" className="text-right">Anonymous</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(v) => setIsAnonymous(!!v)}
                  />
                  <span className="text-sm text-muted-foreground">Post anonymously</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createFeedback.isPending}>
              {createFeedback.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
