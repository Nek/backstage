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

import React, { FC, useState } from 'react';
import { Typography, Grid, Input } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  pageTheme,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core';
import { CircleCIFetch } from '../CircleCIFetch';

export const CircleCIPage: FC<{}> = () => {
  const [token, setToken] = useState<string>('');

  return (
    <Page theme={pageTheme.tool}>
      <Header title="Welcome to circleci!" subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Plugin title">
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title="Information card">
              <Typography variant="body1">
                Please paste your CircleCI token here
                <Input
                  onChange={e => setToken(e.target.value)}
                  type="password"
                  value={token}
                ></Input>
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item>
            <InfoCard title="CI/CD">
              <CircleCIFetch token={token} />
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default CircleCIPage;