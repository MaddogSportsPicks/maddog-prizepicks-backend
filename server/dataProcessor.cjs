class DataProcessor {
  identifyGoblinPicks(rawProps) {
    console.log(`Processing ${rawProps.length} props to find goblin picks...`);
    
    // Group props by type
    const propsByType = this.groupPropsByType(rawProps);
    const goblinPicks = [];

    // Process each prop type separately
    Object.keys(propsByType).forEach(propType => {
      const props = propsByType[propType];
      const goblins = this.findLowestLines(props, propType);
      goblinPicks.push(...goblins);
    });

    console.log(`Identified ${goblinPicks.length} goblin picks`);
    return goblinPicks;
  }

  groupPropsByType(props) {
    const grouped = {};
    
    props.forEach(prop => {
      const normalizedType = this.normalizePropType(prop.propType);
      if (!grouped[normalizedType]) {
        grouped[normalizedType] = [];
      }
      grouped[normalizedType].push({
        ...prop,
        propType: normalizedType, // Use normalized type
        lineValue: this.extractLineValue(prop.line)
      });
    });

    return grouped;
  }

  normalizePropType(propType) {
    const type = propType.toLowerCase();
    if (type.includes('total bases') || type.includes('bases')) {
      return 'Total Bases';
    }
    if (type.includes('fantasy') || type.includes('score')) {
      return 'Fantasy Score';
    }
    if (type.includes('strikeout') || type.includes('k\'s') || type.includes('so')) {
      return 'Strikeouts';
    }
    return propType; // Return original if no match
  }

  extractLineValue(line) {
    // Extract numeric value from line (e.g., "Over 1.5" -> 1.5)
    const match = line.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  findLowestLines(props, propType) {
    if (props.length === 0) return [];

    // Find the minimum line value
    const minLineValue = Math.min(...props.map(p => p.lineValue));
    
    // Get all props with the minimum line value (these are the goblins)
    const goblinPicks = props.filter(prop => prop.lineValue === minLineValue);

    console.log(`${propType}: Found ${goblinPicks.length} goblin picks at line ${minLineValue}`);
    
    return goblinPicks.map(pick => ({
      ...pick,
      isGoblin: true,
      goblinReason: `Lowest ${propType} line available (${pick.line})`
    }));
  }

  // Additional utility methods
  formatPropData(props) {
    return props.map(prop => ({
      ...prop,
      formattedLine: this.formatLine(prop.line),
      gameTimeFormatted: this.formatGameTime(prop.gameTime)
    }));
  }

  formatLine(line) {
    // Ensure consistent line formatting
    if (!line.toLowerCase().includes('over') && !line.toLowerCase().includes('under')) {
      return `Over ${line}`;
    }
    return line;
  }

  formatGameTime(gameTime) {
    if (!gameTime) return 'TBD';
    
    try {
      const date = new Date(gameTime);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      return gameTime;
    }
  }
}

module.exports = new DataProcessor();