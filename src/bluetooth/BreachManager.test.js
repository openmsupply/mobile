import { MILLISECONDS } from '../utilities/constants';
import BreachManager, { destroyBreachManagerInstance } from './BreachManager';

beforeEach(() => {
  destroyBreachManagerInstance();
});

describe('BreachManager: closeBreach', () => {
  it('Returns a closed breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const breachManager = BreachManager(dbService, utils);

    const breach = { id: 'a' };
    const closedBreach = breachManager.closeBreach(breach, 0);

    expect(closedBreach).toEqual({ ...breach, endTimestamp: new Date(0) });
  });
});

describe('BreachManager: createBreach', () => {
  it('Returns a newly created breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };
    const breachManager = BreachManager(dbService, utils);

    const dummyLocation = { id: 'ABC', description: 'DEF' };
    const sensor = { id: 'a', location: dummyLocation };
    const config = {
      id: 'a',
      maximumTemperature: '100',
      minimumTemperature: '0',
      duration: '1',
    };
    const startTimestamp = 0;

    const closedBreach = breachManager.createBreach(
      utils.createUuid(),
      sensor,
      config,
      startTimestamp
    );
    const closedBreachShouldBe = {
      id: '1',
      acknowledged: false,
      endTimestamp: undefined,
      location: dummyLocation,
      sensor,
      startTimestamp: new Date(0),
      thresholdDuration: '1',
      thresholdMaxTemperature: '100',
      thresholdMinTemperature: '0',
      type: undefined,
    };

    expect(closedBreach).toEqual(closedBreachShouldBe);
  });
});

describe('BreachManager: willCreateBreach', () => {
  it('Correctly determines when a breach should be created', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const config = { id: 'a', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 };

    const willCreateBreach = breachManager.willCreateBreach(config, logs);

    expect(willCreateBreach).toEqual(true);
  });

  it('Correctly determines when a breach should not be created because of temperature', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 7 },
    ];
    const config = { id: 'a', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 };

    const willCreateBreach = breachManager.willCreateBreach(config, logs);

    expect(willCreateBreach).toEqual(false);
  });

  it('Correctly determines when a breach should not be created because of duration', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const config = { id: 'a', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 };

    const willCreateBreach = breachManager.willCreateBreach(config, logs);

    expect(willCreateBreach).toEqual(false);
  });
});

describe('BreachManager: willCreateBreachFromConfigs', () => {
  it('Correctly returns the config that makes a breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const configs = [
      { id: 'a', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 },
      { id: 'b', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 },
    ];

    const willCreateBreach = breachManager.willCreateBreachFromConfigs(configs, logs);

    expect(willCreateBreach).toEqual([
      true,
      { id: 'b', minimumTemperature: 8, duration: 1000, maximumTemperature: 999 },
    ]);
  });

  it('Correctly returns false when none should be made', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const logs = [
      { timestamp: 0, temperature: 10 },
      { timestamp: 1, temperature: 10 },
    ];
    const configs = [
      { id: 'a', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 },
      { id: 'b', minimumTemperature: 8, duration: 5000, maximumTemperature: 999 },
    ];

    const willCreateBreach = breachManager.willCreateBreachFromConfigs(configs, logs);

    expect(willCreateBreach[0]).toEqual(false);
  });
});

describe('BreachManager: addLogToBreach', () => {
  it('Correctly adds a log to a breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const log = { id: 'a', timestamp: 0, temperature: 10 };
    const breach = { id: 'breach' };

    const resultLog = breachManager.addLogToBreach(breach, log);

    expect(resultLog).toEqual({ id: 'a', breach });
  });
});

describe('BreachManager: willContinueBreach', () => {
  it('Correctly determines that a breach should be continued by a log', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const breach = {
      thresholdMinTemperature: 8,
      thresholdMaxTemperature: 999,
    };
    const log = { temperature: 10 };

    expect(breachManager.willContinueBreach(breach, log)).toEqual(true);
  });
  it('Correctly determines that a breach should not be continued by a log', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const breach = { thresholdMinTemperature: 8, thresholdMaxTemperature: 999 };
    const log = { temperature: 2 };

    expect(breachManager.willContinueBreach(breach, log)).toEqual(false);
  });
});

describe('BreachManager: willCloseBreach ', () => {
  it('Correctly determines that a log will close off a breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const breach = { thresholdMinTemperature: 8, thresholdMaxTemperature: 999 };
    const log = { temperature: 2 };

    expect(breachManager.willCloseBreach(breach, log)).toEqual(true);
  });
  it('Correctly determines that a breach should be continued by a log', () => {
    const breachManager = BreachManager();

    const breach = { thresholdMinTemperature: 8, thresholdMaxTemperature: 999 };
    const log = { temperature: 10 };

    expect(breachManager.willCloseBreach(breach, log)).toEqual(false);
  });
});

describe('BreachManager: getConfigInBreach', () => {
  it('Correctly determines from one config that a log could be in breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const configs = [{ minimumTemperature: 8, maximumTemperature: 999 }];
    const log = { temperature: 10 };

    expect(breachManager.getConfigInBreach(log, configs)).toEqual(configs[0]);
  });
  it('Correctly determines from many configs that a log could be in breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const configs = [
      { minimumTemperature: 8, maximumTemperature: 999 },
      { minimumTemperature: -999, maximumTemperature: 2 },
    ];
    const log = { temperature: 10 };

    expect(breachManager.getConfigInBreach(log, configs)).toEqual(configs[0]);
  });
  it('Correctly determines from many configs that a log should not be in breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const configs = [
      { minimumTemperature: 8, maximumTemperature: 999 },
      { minimumTemperature: -999, maximumTemperature: 2 },
    ];
    const log = { temperature: 4 };

    expect(breachManager.getConfigInBreach(log, configs)).toBeUndefined();
  });
  it('Correctly determines from a config that a log should not be in breach', () => {
    const dbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(dbService, utils);

    const configs = [{ minimumTemperature: 8, maximumTemperature: 999 }];
    const log = { temperature: 4 };

    expect(breachManager.getConfigInBreach(log, configs)).toBeUndefined();
  });
});

describe('BreachManager: updateBreaches', () => {
  it('returns updated records', async () => {
    const upsertMock = jest.fn(entities => entities);
    const mockDbService = { upsertBreaches: upsertMock, upsertTemperatureLog: upsertMock };

    const breachManager = BreachManager(mockDbService);

    const breaches = [{ id: 'a' }, { id: 'b' }];
    const logs = [{ id: 'a', timestamp: new Date(0), temperature: 0 }];

    const result = breachManager.updateBreaches(breaches, logs);

    await expect(result).resolves.toEqual([breaches, logs]);
  });
});

describe('BreachManager: createBreachesFrom', () => {
  it('Returns the correct timestamp when one exists', async () => {
    const mockGetMostRecentBreachLog = jest.fn(async () => ({ timestamp: 1 }));
    const mockDbService = { getMostRecentBreachLog: mockGetMostRecentBreachLog };

    const breachManager = BreachManager(mockDbService);

    await expect(breachManager.createBreachesFrom('a')).resolves.toEqual(1);
  });
  it('Returns the correct timestamp when none exist', async () => {
    const mockGetMostRecentBreachLog = jest.fn(async () => ({}));
    const mockDbService = { getMostRecentBreachLog: mockGetMostRecentBreachLog };

    const breachManager = BreachManager(mockDbService);

    await expect(breachManager.createBreachesFrom('a')).resolves.toEqual(0);
  });
});

describe('BreachManager: createBreaches', () => {
  it('Creates a simple single breach', async () => {
    const dummyLocation = { id: 'ABC', description: 'DEF' };
    const sensor = { id: 'a', location: dummyLocation };
    const logs = [
      { id: 'a', temperature: 10, timestamp: 0 },
      { id: 'b', temperature: 10, timestamp: 1 },
    ];
    const configs = [{ id: 'a', duration: 1000, minimumTemperature: 8, maximumTemperature: 999 }];
    const utils = { createUuid: () => '1' };
    const dbService = {};

    const breachManager = BreachManager(dbService, utils);

    const breachesShouldBe = [
      {
        id: '1',
        acknowledged: false,
        sensor,
        thresholdMaxTemperature: 999,
        thresholdMinTemperature: 8,
        thresholdDuration: 1000,
        startTimestamp: new Date(0),
        endTimestamp: undefined,
        location: dummyLocation,
      },
    ];

    const logsShouldBe = [
      { id: 'a', breach: breachesShouldBe[0] },
      { id: 'b', breach: breachesShouldBe[0] },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
  it('Creates a single breach when multiple breach boundaries are crossed', async () => {
    const dummyLocation = { id: 'ABC', description: 'DEF' };
    const sensor = { id: 'a', location: dummyLocation };
    const logs = [
      { id: 'a', temperature: 1, timestamp: 0 },
      { id: 'b', temperature: 9, timestamp: 1 },
      { id: 'c', temperature: 9, timestamp: 2 },
      { id: 'd', temperature: 9, timestamp: 3 },
    ];
    const configs = [
      {
        id: 'a',
        duration: 2000,
        minimumTemperature: 8,
        maximumTemperature: 999,
        type: 'HOT_CONSECUTIVE',
      },
      {
        id: 'b',
        duration: 2000,
        minimumTemperature: -999,
        maximumTemperature: 2,
        type: 'COLD_CONSECUTIVE',
      },
    ];
    const utils = { createUuid: () => '1' };
    const dbService = {};

    const breachManager = BreachManager(dbService, utils);

    const breachesShouldBe = [
      {
        id: '1',
        acknowledged: false,
        sensor,
        thresholdMaxTemperature: 999,
        thresholdMinTemperature: 8,
        thresholdDuration: 2000,
        startTimestamp: new Date(1 * MILLISECONDS.ONE_SECOND),
        endTimestamp: undefined,
        location: dummyLocation,
        type: 'HOT_CONSECUTIVE',
      },
    ];

    const logsShouldBe = [
      { id: 'b', breach: breachesShouldBe[0] },
      { id: 'c', breach: breachesShouldBe[0] },
      { id: 'd', breach: breachesShouldBe[0] },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
  it('Creates a simple single breach that is closed', async () => {
    const dummyLocation = { id: 'ABC', description: 'DEF' };
    const sensor = { id: 'a', location: dummyLocation };
    const logs = [
      { id: 'a', temperature: 10, timestamp: 0 },
      { id: 'b', temperature: 10, timestamp: 1 },
      { id: 'c', temperature: 1, timestamp: 2 },
    ];
    const configs = [
      {
        id: 'a',
        acknowledged: false,
        duration: 1000,
        minimumTemperature: 8,
        maximumTemperature: 999,
        type: 'HOT_CONSECUTIVE',
      },
    ];

    const utils = { createUuid: () => '1' };
    const dbService = {};
    const breachManager = BreachManager(dbService, utils);

    const breachesShouldBe = [
      {
        id: '1',
        acknowledged: false,
        sensor,
        thresholdMinTemperature: 8,
        thresholdMaxTemperature: 999,
        thresholdDuration: 1000,
        startTimestamp: new Date(0),
        endTimestamp: new Date(2 * MILLISECONDS.ONE_SECOND),
        location: dummyLocation,
        type: 'HOT_CONSECUTIVE',
      },
    ];

    const logsShouldBe = [
      { id: 'a', breach: breachesShouldBe[0] },
      { id: 'b', breach: breachesShouldBe[0] },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });

  it('Creates multiple breaches', async () => {
    const dummyLocation = { id: 'ABC', description: 'DEF' };
    const sensor = { id: 'a', location: dummyLocation };
    const logs = [
      { id: 'a', temperature: 10, timestamp: 0 },
      { id: 'b', temperature: 10, timestamp: 1 },
      { id: 'c', temperature: 1, timestamp: 2 },
      { id: 'd', temperature: 10, timestamp: 3 },
      { id: 'e', temperature: 10, timestamp: 4 },
    ];
    const configs = [
      {
        id: 'a',
        duration: 1000,
        minimumTemperature: 8,
        maximumTemperature: 999,
        type: 'HOT_CONSECUTIVE',
      },
    ];
    const mockDbService = {};
    const utils = { createUuid: () => '1' };

    const breachManager = BreachManager(mockDbService, utils);

    const breachesShouldBe = [
      {
        id: '1',
        acknowledged: false,
        sensor,
        startTimestamp: new Date(0),
        thresholdMinTemperature: 8,
        thresholdMaxTemperature: 999,
        thresholdDuration: 1000,
        endTimestamp: new Date(2 * MILLISECONDS.ONE_SECOND),
        location: dummyLocation,
        type: 'HOT_CONSECUTIVE',
      },
      {
        id: '1',
        acknowledged: false,
        sensor,
        startTimestamp: new Date(3 * MILLISECONDS.ONE_SECOND),
        thresholdMinTemperature: 8,
        thresholdMaxTemperature: 999,
        thresholdDuration: 1000,
        endTimestamp: undefined,
        location: dummyLocation,
        type: 'HOT_CONSECUTIVE',
      },
    ];

    const logsShouldBe = [
      { id: 'a', breach: breachesShouldBe[0] },
      { id: 'b', breach: breachesShouldBe[0] },
      { id: 'd', breach: breachesShouldBe[1] },
      { id: 'e', breach: breachesShouldBe[1] },
    ];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });

  it('Respects duration when creating breaches', async () => {
    const sensor = { id: 'a' };
    const logs = [
      { temperature: 10, timestamp: 0 },
      { temperature: 1, timestamp: 2 },
      { temperature: 10, timestamp: 4 },
    ];
    const configs = [{ id: 'a', duration: 1000, minimumTemperature: 8, maximumTemperature: 999 }];

    const dbService = {};
    const utils = { createUuid: () => '1' };
    const breachManager = BreachManager(dbService, utils);

    const breachesShouldBe = [];
    const logsShouldBe = [];

    await expect(breachManager.createBreaches(sensor, logs, configs)).toEqual([
      breachesShouldBe,
      logsShouldBe,
    ]);
  });
});
