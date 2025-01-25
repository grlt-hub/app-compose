import { colors, type SkippedContainers } from '@shared';

type Params = {
  skippedContainers: SkippedContainers;
  INDENT: string;
};

const getSkippedContainers = ({ skippedContainers, INDENT }: Params) => {
  if (Object.keys(skippedContainers).length === 0) {
    return '';
  }

  const reversedSkipped: SkippedContainers = {};
  
  for (const containerId in skippedContainers) {
    for (const dependency of skippedContainers[containerId]!) {
      (reversedSkipped[dependency] ||= []).push(containerId);
    }
  }

  return Object.entries(reversedSkipped)
    .map(([depId, containers]) => {
      return `- ${colors.yellow(depId)}: [${containers.join(', ')}]`;
    })
    .join(`\n${INDENT}`);
};

export { getSkippedContainers };
