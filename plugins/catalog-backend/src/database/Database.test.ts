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

import knex from 'knex';
import path from 'path';
import { Database } from './Database';
import {
  DatabaseComponent,
  AddDatabaseLocation,
  DatabaseLocation,
  AddDatabaseComponent,
} from './types';
import * as Knex from 'knex';

describe('Database', () => {
  const database = knex({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  });
  beforeEach(async () => {
    await database.raw('PRAGMA foreign_keys = ON');
    await database.migrate.latest({
      directory: path.resolve(__dirname, 'migrations'),
      loadExtensions: ['.ts'],
    });
  });

  it('adds or updates component', async () => {
    await database.raw('PRAGMA foreign_keys = OFF');
    const db = new Database(database);

    const componentName = 'SomeComponent';

    const addInput = {
      name: componentName,
    };
    const addOutput: DatabaseComponent = {
      id: expect.anything(),
      name: componentName,
      locationId: null,
    };

    db.addOrUpdateComponent(addInput);

    let component = await db.component(componentName);
    expect(component).toEqual(addOutput);

    const updateInput = { ...addInput, locationId: '123' };

    db.addOrUpdateComponent(updateInput);
    component = await db.component(componentName);
    const updateOutput: DatabaseComponent = {
      id: expect.anything(),
      name: componentName,
      locationId: '123',
    };
    expect(component).toEqual(updateOutput);
  });

  it('manages locations', async () => {
    const db = new Database(database);
    const input: AddDatabaseLocation = { type: 'a', target: 'b' };
    const output: DatabaseLocation = {
      id: expect.anything(),
      type: 'a',
      target: 'b',
    };

    await db.addLocation(input);

    const locations = await db.locations();
    expect(locations).toEqual([output]);
    const location = await db.location(locations[0].id);
    expect(location).toEqual(output);

    await db.removeLocation(locations[0].id);

    await expect(db.locations()).resolves.toEqual([]);
    await expect(db.location(locations[0].id)).rejects.toThrow(
      /Found no location/,
    );
  });

  it('instead of adding second location with the same target, returns existing one', async () => {
    // Prepare
    const catalog = new Database(database);
    const input: AddDatabaseLocation = { type: 'a', target: 'b' };
    const output1: DatabaseLocation = await catalog.addLocation(input);

    // Try to insert the same location
    const output2: DatabaseLocation = await catalog.addLocation(input);
    const locations = await catalog.locations();

    // Output is the same
    expect(output2).toEqual(output1);
    // Locations contain only one record
    expect(locations).toEqual([output1]);
  });
});
