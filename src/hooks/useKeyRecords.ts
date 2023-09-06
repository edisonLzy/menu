import * as React from 'react';
import { useRef, useCallback } from 'react';
import warning from 'rc-util/lib/warning';
import { nextSlice } from '../utils/timeUtil';

const PATH_SPLIT = '__RC_UTIL_PATH_SPLIT__';

const getPathStr = (keyPath: string[]) => keyPath.join(PATH_SPLIT);
const getPathKeys = (keyPathStr: string) => keyPathStr.split(PATH_SPLIT);

export const OVERFLOW_KEY = 'rc-menu-more';

export default function useKeyRecords() {
  const [, internalForceUpdate] = React.useState({});
  const key2pathRef = useRef(new Map<string, string>());
  const path2keyRef = useRef(new Map<string, string>());
  const [overflowKeys, setOverflowKeys] = React.useState([]);
  const updateRef = useRef(0);
  const destroyRef = useRef(false);

  const forceUpdate = () => {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };

  const registerPath = useCallback((key: string, keyPath: string[]) => {
    // Warning for invalidate or duplicated `key`
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !key2pathRef.current.has(key),
        `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`,
      );
    }

    // Fill map
    const connectedPath = getPathStr(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);

    updateRef.current += 1;
    const id = updateRef.current;

    nextSlice(() => {
      // 这里利用 closure 保存 id，如果中途有新的 registerPath，会导致 id 不一致，从而不会触发 forceUpdate
      if (id === updateRef.current) {
        forceUpdate();
        console.log(key2pathRef);

      }
    });
  }, []);

  const unregisterPath = useCallback((key: string, keyPath: string[]) => {
    const connectedPath = getPathStr(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);

  const refreshOverflowKeys = useCallback((keys: string[]) => {
    setOverflowKeys(keys);
  }, []);

  const getKeyPath = useCallback(
    (eventKey: string, includeOverflow?: boolean) => {
      // 获取 eventKey 的 fullPath
      // [2-3-1]-> [2,2-3,2-3-1]
      const fullPath = key2pathRef.current.get(eventKey) || '';
      const keys = getPathKeys(fullPath);
      // 这个用来高亮 更多按钮吗 ?
      if (includeOverflow && overflowKeys.includes(keys[0])) {
        keys.unshift(OVERFLOW_KEY);
      }

      return keys;
    },
    [overflowKeys],
  );
  // 🔥 判断 pathKeys 是否是 eventKey 的子路径
  // [2-3-1] <- [2-3] <- [2]
  const isSubPathKey = useCallback(
    (pathKeys: string[], eventKey: string) =>
    pathKeys.some(pathKey => {
        // 获取点击 key 的 fullPath
        const pathKeyList = getKeyPath(pathKey, true);
        // 判断 fullPath 中是否包含 eventKey
        // 比如 是否包含 SubMenu 的 eventKey用于高亮
        return pathKeyList.includes(eventKey);
      }),
    [getKeyPath],
  );

  const getKeys = () => {
    const keys = [...key2pathRef.current.keys()];

    if (overflowKeys.length) {
      keys.push(OVERFLOW_KEY);
    }

    return keys;
  };

  /**
   * Find current key related child path keys
   */
  const getSubPathKeys = useCallback((key: string): Set<string> => {
    const connectedPath = `${key2pathRef.current.get(key)}${PATH_SPLIT}`;
    const pathKeys = new Set<string>();

    [...path2keyRef.current.keys()].forEach(pathKey => {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.current.get(pathKey));
      }
    });
    return pathKeys;
  }, []);

  React.useEffect(
    () => () => {
      destroyRef.current = true;
    },
    [],
  );

  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,

    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys,
  };
}
