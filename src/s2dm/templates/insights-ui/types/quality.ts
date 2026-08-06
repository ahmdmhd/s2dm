type QualitySeverity = "warning" | "info";

export type QualityIssue = {
	target: string;
	problem: string;
	severity: QualitySeverity;
	category: string;
};

export type QualityResponse = {
	issues: QualityIssue[];
};
