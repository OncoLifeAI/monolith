# Severity Filter Design Options

Here are 4 different design approaches for the severity filter:

## Option 1: Chip-Based Selection (Currently Implemented)
**Style**: Interactive colored chips
**Interaction**: Click to toggle severity levels
**Visual**: Color-coded chips (green to red)
**Pros**: Intuitive, colorful, easy to understand
**Cons**: Takes more vertical space

## Option 2: Dropdown with Multi-Select
```typescript
<FormControl size="small" fullWidth>
  <InputLabel>Severity Levels</InputLabel>
  <Select
    multiple
    value={selectedSeverities}
    onChange={handleSeverityChange}
    label="Severity Levels"
    renderValue={(selected) => `${selected.length} levels selected`}
  >
    {severityOptions.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        <Checkbox checked={selectedSeverities.includes(option.value)} />
        <ListItemText primary={option.label} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
```
**Pros**: Compact, familiar UI pattern
**Cons**: Hidden until clicked, less visual

## Option 3: Toggle Button Group
```typescript
<ToggleButtonGroup
  value={selectedSeverities}
  onChange={handleSeverityToggle}
  aria-label="severity levels"
  size="small"
>
  {severityOptions.map((option) => (
    <ToggleButton 
      key={option.value} 
      value={option.value}
      sx={{ 
        minWidth: 'auto',
        padding: '4px 8px',
        fontSize: '0.75rem'
      }}
    >
      {option.label}
    </ToggleButton>
  ))}
</ToggleButtonGroup>
```
**Pros**: Clear on/off states, compact
**Cons**: Can look cluttered with many options

## Option 4: Segmented Control (iOS Style)
```typescript
<Box sx={{ 
  display: 'flex', 
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '2px',
  gap: '2px'
}}>
  {severityOptions.map((option) => (
    <Button
      key={option.value}
      variant={selectedSeverities.includes(option.value) ? 'contained' : 'text'}
      size="small"
      onClick={() => toggleSeverity(option.value)}
      sx={{
        minWidth: 'auto',
        borderRadius: '6px',
        fontSize: '0.7rem',
        textTransform: 'none',
        ...(selectedSeverities.includes(option.value) ? {
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          color: theme.colors.primary
        } : {
          backgroundColor: 'transparent',
          color: theme.colors.gray[600]
        })
      }}
    >
      {option.label}
    </Button>
  ))}
</Box>
```
**Pros**: Modern, clean, iOS-like feel
**Cons**: Might be unfamiliar to some users

## Option 5: Range Selector with Visual Indicators
```typescript
<Box>
  <Typography variant="subtitle2">Severity Range</Typography>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <Select value={severityRange[0]} onChange={handleMinChange}>
        {severityOptions.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
    <Typography variant="body2" color="text.secondary">to</Typography>
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <Select value={severityRange[1]} onChange={handleMaxChange}>
        {severityOptions.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
</Box>
```
**Pros**: Precise range selection, compact
**Cons**: Less visual, requires two interactions

## Option 6: Card-Based Selection
```typescript
<Box>
  <Typography variant="subtitle2">Filter by Severity</Typography>
  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
    {severityOptions.map((option) => (
      <Paper
        key={option.value}
        elevation={selectedSeverities.includes(option.value) ? 3 : 1}
        sx={{
          padding: '8px 12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: selectedSeverities.includes(option.value) 
            ? theme.colors.primary 
            : 'white',
          color: selectedSeverities.includes(option.value) 
            ? 'white' 
            : theme.colors.gray[700],
          '&:hover': {
            elevation: 2,
            transform: 'translateY(-1px)'
          }
        }}
        onClick={() => toggleSeverity(option.value)}
      >
        <Typography variant="caption" fontWeight={500}>
          {option.label}
        </Typography>
      </Paper>
    ))}
  </Box>
</Box>
```
**Pros**: Card-like feel, good hover states
**Cons**: Takes more space

Which option would you like me to implement? Or would you like to see a combination of these approaches?

