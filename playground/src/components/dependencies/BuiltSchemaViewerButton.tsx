import { Eye } from "lucide-react";
import { useState } from "react";
import { TextEditor } from "@/components/TextEditor";
import { TextEditorDialog } from "@/components/TextEditorDialog";
import { Button } from "@/components/ui/button";
import { selectBuiltSchema } from "@/store/deps/build/buildSlice";
import { useAppSelector } from "@/store/hooks";

const DIALOG_TITLE = "Built Dependency Schema";

type BuiltSchemaViewerButtonProps = {
  size?: "icon" | "icon-sm";
};

export function BuiltSchemaViewerButton({
  size = "icon",
}: BuiltSchemaViewerButtonProps) {
  const [open, setOpen] = useState(false);
  const builtSchema = useAppSelector(selectBuiltSchema);
  const hasBuiltSchema = Boolean(builtSchema?.trim());

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={() => setOpen(true)}
        disabled={!hasBuiltSchema}
        title="View built dependency schema"
      >
        <Eye />
      </Button>
      <TextEditorDialog open={open} onOpenChange={setOpen} title={DIALOG_TITLE}>
        <TextEditor
          language="graphql"
          value={builtSchema ?? ""}
          fullscreenTitle={DIALOG_TITLE}
          fileName="built-dependencies.graphql"
          isExpandable={false}
          readOnly
        />
      </TextEditorDialog>
    </>
  );
}
