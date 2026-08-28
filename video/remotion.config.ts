import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// The film is mostly flat colour and heavy type, so a low CRF costs little and
// keeps the letterforms free of the mush that ruins a pitch on a projector.
Config.setCrf(16);
