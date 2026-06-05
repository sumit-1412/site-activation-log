import type { TemplateAsset } from '../types';
import raw from './templates.json';

export const TEMPLATES = raw as Record<string, TemplateAsset>;
