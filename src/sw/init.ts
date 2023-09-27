import { Config, CachedFilters } from '@/types/config';
import { InitOfflineData } from '@/types/config';
const broadcast = new BroadcastChannel('offline-broadcast');



const onReady = (initData: InitOfflineData) => {
  let checkOfflineTimeout: number;
  const DEFAULT_OFFLINE_TIMEOUT = 120000;
  const REQUESTS_FOR_CHECK = 2;
  const OFFLINE_TIMEOUT = initData.offlineTimeout ?? DEFAULT_OFFLINE_TIMEOUT;
  let urlParams = new URLSearchParams(window.location.search);
  const queryString = urlParams.get('homePage') || '';
  urlParams = new URLSearchParams(queryString);
  const config: Config = {
    version: initData.version,
    appLocation: initData.appLocation,
    controllerLocation: initData.controllerLocation,
    offlineTimeout: initData.offlineTimeout,
    detectOfflineUsingNavigatorApi: initData.detectOfflineUsingNavigatorApi,
    offlineSyncInterval: initData.offlineSyncInterval,
    layoutId: initData.layoutId,
    task_id: urlParams.get('TASKID') || '',
  };

  broadcast.postMessage({
    type: 'SET_CONFIG',
    config,
  });

  window.localStorage.setItem('offlineConfig', JSON.stringify(config));

  const cashFilters = () => {
    const cachedFilters: CachedFilters = {
      VEHICLEMAKE: [],
      VEHICLEMODEL: [],
      VEHICLEYEAR: [],
      CARSECTION: [],
    };
    $(window).trigger('kms.search.filters.get.selected.values', [
      function (selectedFilterValues: Array<{ name: string; value: string }>) {
        selectedFilterValues.forEach((filter) => {
          const trimmedValue = filter.value.trim();
          switch (filter.name) {
            case 'Vehicle Make':
              cachedFilters.VEHICLEMAKE?.push(trimmedValue);
              break;
            case 'Vehicle Model':
              cachedFilters.VEHICLEMODEL?.push(trimmedValue);
              break;
            case 'Vehicle Year Range':
              cachedFilters.VEHICLEYEAR?.push(trimmedValue);
              break;
            case 'Category':
              cachedFilters.CARSECTION?.push(trimmedValue);
              break;
          }
        });
        window.localStorage.setItem('cachedFilters', JSON.stringify(cachedFilters));
      },
    ]);
  };

  const switchToOffline = () => {
    cashFilters();
    checkOfflineTimeout = window.setTimeout(() => showOfflineNotification(initData), OFFLINE_TIMEOUT);
  };

  const cancelSwitchToOffline = () => {
    clearTimeout(checkOfflineTimeout);
    hideOfflineNotification();
  };

  const offlineChecker = () => {
    if (initData.detectOfflineUsingNavigatorApi) {
      window.addEventListener('offline', switchToOffline);
      window.addEventListener('online', cancelSwitchToOffline);
    } else {
      let requestsCount = 0;

      setInterval(async () => {
        try {
          await fetch(`${initData.appLocation}/kms/lh/profile/whatsmyname`);
          requestsCount = 0;
        } catch {
          requestsCount += 1;
        }

        if (requestsCount === REQUESTS_FOR_CHECK) {
          cashFilters();
          showOfflineNotification(initData);
        }

        if (requestsCount === 0) {
          hideOfflineNotification();
        }
      }, Math.max(OFFLINE_TIMEOUT, 5_000));
    }
  };

  offlineChecker();
};

window.com.kms.web.offline = {
  init: async (initData: InitOfflineData) => {
    if ('serviceWorker' in navigator) {
      if (!initData.offlineEnabled || !initData.hasOfflineFunction) {
        return broadcast.postMessage({ type: 'DISABLE_OFFLINE' });
      }
      const registration = await navigator.serviceWorker.register(
        `${initData.appLocation}/resources/service-worker.js?version=${initData.version}`,
        { scope: '/' }
      );

      const onInstall = () => {
        const installingSW = registration.installing;
        installingSW?.addEventListener('statechange', () => {
          if (installingSW.state === 'activated') {
            onReady(initData);
          }
        });
      };

      if (registration.waiting || registration.active) {
        onReady(initData);
      }

      registration.addEventListener('updatefound', () => {
        onInstall();
      });
    }
  },
};
