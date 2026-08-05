const SAVE_STORAGE_KEY = "chromasightSaveData";
const SAVE_VERSION = 1;

/**
 * Browser-backed JSON save data manager.
 *
 * The browser cannot silently write to an arbitrary local `.json` file, so the
 * game keeps the save as JSON in localStorage. `exportJson()` returns the same
 * data as a formatted JSON string if a file export button is added later.
 */
class ChromasightSaveData {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  /** @returns {object} Fresh default save data. */
  createDefaultSave() {
    return {
      version: SAVE_VERSION,
      currentLevelName: "level_1",
      currentRespawnName: "",
      currentMode: "colorBlindness",
      unlockedModes: ["colorBlindness"],
      collectedItems: {},
      hasSeenStory: false,
      updatedAt: new Date().toISOString()
    };
  }

  /** @returns {object} Loaded and normalized save data. */
  load() {
    const rawSave = this.storage.getItem(SAVE_STORAGE_KEY);
    if (!rawSave) return this.createDefaultSave();

    try {
      return this.normalize(JSON.parse(rawSave));
    } catch (error) {
      console.warn("Failed to parse Chromasight save data. Resetting save.", error);
      return this.createDefaultSave();
    }
  }

  /**
   * Writes save data to browser localStorage as formatted JSON.
   *
   * @param {object} saveData Runtime save data.
   * @returns {object} Normalized save data that was written.
   */
  save(saveData) {
    const normalizedSave = this.normalize({
      ...saveData,
      updatedAt: new Date().toISOString()
    });
    this.storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(normalizedSave, null, 2));
    return normalizedSave;
  }

  /** Clears save data and returns a new default save. */
  reset() {
    this.storage.removeItem(SAVE_STORAGE_KEY);
    return this.createDefaultSave();
  }

  /** @returns {string} Current save data as formatted JSON text. */
  exportJson() {
    return JSON.stringify(this.load(), null, 2);
  }

  /**
   * Normalizes the current save shape.
   *
   * `collectedItems` stores one array per level. Each record keeps the Tiled
   * object id and the collectible class state used by the game.
   *
   * @param {object} saveData Parsed save object.
   * @returns {object}
   */
  normalize(saveData = {}) {
    const defaultSave = this.createDefaultSave();
    const collectedItems = saveData.collectedItems && typeof saveData.collectedItems === "object"
      ? saveData.collectedItems
      : {};

    return {
      version: Number(saveData.version || defaultSave.version),
      currentLevelName: saveData.currentLevelName || defaultSave.currentLevelName,
      currentRespawnName: saveData.currentRespawnName || defaultSave.currentRespawnName,
      currentMode: saveData.currentMode || defaultSave.currentMode,
      unlockedModes: Array.isArray(saveData.unlockedModes)
        ? [...new Set(saveData.unlockedModes)]
        : [...defaultSave.unlockedModes],
      collectedItems: Object.fromEntries(
        Object.entries(collectedItems).map(([levelName, items]) => [
          levelName,
          Array.isArray(items)
            ? items
                .filter((item) => item && Number.isFinite(Number(item.id)))
                .map((item) => ({
                  id: Number(item.id),
                  collectible: {
                    Picked: Boolean(item.collectible?.Picked)
                  }
                }))
            : []
        ])
      ),
      hasSeenStory: Boolean(saveData.hasSeenStory),
      updatedAt: saveData.updatedAt || defaultSave.updatedAt
    };
  }
}
