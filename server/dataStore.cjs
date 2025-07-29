class DataStore {
  constructor() {
    this.goblinPicks = [];
    this.scrapeStatus = {
      status: 'idle',
      message: 'Waiting for first scrape...',
      lastScrape: null,
      nextScrape: this.getNextScrapeTime()
    };
  }

  storeGoblinPicks(picks) {
    this.goblinPicks = picks.map(pick => ({
      ...pick,
      id: this.generateId(),
      storedAt: new Date().toISOString()
    }));
    
    console.log(`Stored ${picks.length} goblin picks`);
  }

  getGoblinPicks(propType) {
    return this.goblinPicks.filter(pick => pick.propType === propType);
  }

  getAllGoblinPicks() {
    const groupedPicks = {
      'Total Bases': this.getGoblinPicks('Total Bases'),
      'Fantasy Score': this.getGoblinPicks('Fantasy Score'),
      'Strikeouts': this.getGoblinPicks('Strikeouts')
    };

    return {
      summary: {
        totalPicks: this.goblinPicks.length,
        totalBases: groupedPicks['Total Bases'].length,
        fantasyScore: groupedPicks['Fantasy Score'].length,
        strikeouts: groupedPicks['Strikeouts'].length,
        lastUpdate: this.scrapeStatus.lastScrape
      },
      picks: groupedPicks
    };
  }

  updateScrapeStatus(status, message) {
    this.scrapeStatus = {
      status,
      message,
      lastScrape: status === 'completed' ? new Date().toISOString() : this.scrapeStatus.lastScrape,
      nextScrape: this.getNextScrapeTime()
    };
  }

  getScrapeStatus() {
    return {
      ...this.scrapeStatus,
      nextScrape: this.getNextScrapeTime()
    };
  }

  getNextScrapeTime() {
    const now = new Date();
    const eastern = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    // Set times for 12 PM and 5 PM EST
    const noon = new Date(eastern);
    noon.setHours(12, 0, 0, 0);
    
    const fivePM = new Date(eastern);
    fivePM.setHours(17, 0, 0, 0);

    // Determine next scrape time
    if (eastern < noon) {
      return noon.toISOString();
    } else if (eastern < fivePM) {
      return fivePM.toISOString();
    } else {
      // Next day at noon
      const nextNoon = new Date(noon);
      nextNoon.setDate(nextNoon.getDate() + 1);
      return nextNoon.toISOString();
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Utility methods for data analysis
  getPicksByTeam(team) {
    return this.goblinPicks.filter(pick => 
      pick.team === team || pick.opponent === team
    );
  }

  getPicksByPlayer(playerName) {
    return this.goblinPicks.filter(pick => 
      pick.player.toLowerCase().includes(playerName.toLowerCase())
    );
  }

  getStatistics() {
    const stats = {
      totalPicks: this.goblinPicks.length,
      byPropType: {},
      byTeam: {},
      averageLines: {},
      lastUpdate: this.scrapeStatus.lastScrape
    };

    // Group by prop type
    this.goblinPicks.forEach(pick => {
      // By prop type
      if (!stats.byPropType[pick.propType]) {
        stats.byPropType[pick.propType] = 0;
      }
      stats.byPropType[pick.propType]++;

      // By team
      if (!stats.byTeam[pick.team]) {
        stats.byTeam[pick.team] = 0;
      }
      stats.byTeam[pick.team]++;
    });

    return stats;
  }
}

module.exports = new DataStore();