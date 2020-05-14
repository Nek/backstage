/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { FC } from 'react';
import { CITableBuildInfo, CITable } from '../CITable';
import { BuildSummary } from '../../../../api';
import { useBuilds } from '../../builds';
import { useSettings } from '../../../SettingsPage/settings';

const makeReadableStatus = (status: string | undefined) => {
  if (!status) return '';
  return ({
    retried: 'Retried',
    canceled: 'Canceled',
    infrastructure_fail: 'Infra fail',
    timedout: 'Timedout',
    not_run: 'Not run',
    running: 'Running',
    failed: 'Failed',
    queued: 'Queued',
    scheduled: 'Scheduled',
    not_running: 'Not running',
    no_tests: 'No tests',
    fixed: 'Fixed',
    success: 'Success',
  } as Record<string, string>)[status];
};

const transform = (
  buildsData: BuildSummary[],
  restartBuild: { (buildId: number): Promise<void> },
): CITableBuildInfo[] => {
  return buildsData.map((buildData) => {
    const tableBuildInfo: CITableBuildInfo = {
      id: String(buildData.build_num),
      buildName: buildData.subject
        ? buildData.subject +
          (buildData.retry_of ? ` (retry of #${buildData.retry_of})` : '')
        : '',
      onRetryClick: () =>
        typeof buildData.build_num !== 'undefined' &&
        restartBuild(buildData.build_num),
      source: {
        branchName: String(buildData.branch),
        commit: {
          hash: String(buildData.vcs_revision),
          url: 'todo',
        },
      },
      status: makeReadableStatus(buildData.status),
      buildUrl: buildData.build_url,
    };
    return tableBuildInfo;
  });
};

export const Builds: FC<{}> = () => {
  const [{ builds }, { restartBuild }] = useBuilds();
  const [{ repo, owner }] = useSettings();
  const transformedBuilds = transform(builds, restartBuild);

  return (
    <CITable builds={transformedBuilds} projectName={`${owner}/${repo}`} />
  );
};