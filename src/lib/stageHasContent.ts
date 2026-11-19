import type { StageData } from "../types";

export const stageHasContent = (stage: StageData): boolean =>
  !!(
    stage.intentDetails ||
    stage.sopOptions ||
    stage.businessRuleCategories ||
    stage.sources ||
    stage.extractedFields ||
    stage.validationChecks ||
    stage.journalLines ||
    stage.uploadBatchId ||
    stage.stdJEPostingData ||
    stage.adHocJEPostingData ||
    stage.gitJEPostingData ||
    stage.gitJETemplateData
  );
