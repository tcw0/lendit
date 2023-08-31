import * as React from 'react'

// mui components
import { Typography, Grid, Button, Tooltip } from '@mui/material'

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

import { WeekdayEnum } from '@api/models/WeekdayEnum'

import { DateRangePicker } from 'rsuite'
import 'rsuite/dist/rsuite.css'
import { RangeType } from 'rsuite/DateRangePicker'

import { startOfDay, endOfDay, addDays } from 'date-fns'

const ranges = [
  {
    label: 'Today',
    value: [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: 'Next 7 Days',
    value: [startOfDay(new Date()), endOfDay(addDays(new Date(), 6))],
  },
]

export default function AvailabilityForm({
  selectedWeekdays,
  setSelectedWeekdays,
  whitelist,
  setWhitelist,
  blacklist,
  setBlacklist,
}: {
  selectedWeekdays: WeekdayEnum[]
  setSelectedWeekdays: React.Dispatch<React.SetStateAction<WeekdayEnum[]>>
  whitelist: [[Date, Date] | null]
  setWhitelist: React.Dispatch<React.SetStateAction<[[Date, Date] | null]>>
  blacklist: [[Date, Date] | null]
  setBlacklist: React.Dispatch<React.SetStateAction<[[Date, Date] | null]>>
}) {
  const handleWeekdayClick = (weekday: WeekdayEnum) => {
    if (selectedWeekdays.includes(weekday)) {
      setSelectedWeekdays(selectedWeekdays.filter(day => day !== weekday))
    } else {
      setSelectedWeekdays([...selectedWeekdays, weekday])
    }
  }

  const handleWhitelistChange = (index: number, value: [Date, Date] | null) => {
    const updatedWhitelist = [...whitelist]
    updatedWhitelist[index] = value
    setWhitelist(updatedWhitelist as [[Date, Date] | null])
  }

  const addAvailability = () => {
    setWhitelist([...whitelist, null] as unknown as [[Date, Date] | null])
  }

  const handleBlacklistChange = (index: number, value: [Date, Date] | null) => {
    const updatedBlacklist = [...blacklist]
    updatedBlacklist[index] = value
    setBlacklist(updatedBlacklist as [[Date, Date] | null])
  }

  const addUnavailability = () => {
    setBlacklist([...blacklist, null] as unknown as [[Date, Date] | null])
  }

  const { beforeToday } = DateRangePicker

  return (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Item availability
      </Typography>

      <Grid
        container
        columns={{ xs: 5, md: 12 }}
        justifyContent="start"
        alignItems="center"
        rowSpacing={3}
        sx={{ p: 4, pl: '5%' }}
      >
        <Grid item xs={4} display="flex" alignItems="center">
          <Typography fontWeight="bold">Weekday Availability*</Typography>
          <Tooltip title="Specify the days of the week when the item is usually available for lending. Select one or more weekdays from Monday to Sunday.">
            <HelpOutlineIcon
              fontSize="small"
              sx={{ marginLeft: '4px', color: 'grey' }}
            />
          </Tooltip>
        </Grid>
        <Grid
          container
          item
          xs={12}
          md={8}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {Object.values(WeekdayEnum).map((weekday, index) => (
            <Grid item key={weekday}>
              <Button
                key={weekday}
                variant={
                  selectedWeekdays.includes(weekday) ? 'contained' : 'outlined'
                }
                sx={{
                  borderRadius: '0',
                  ...(index === 0 && {
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  }),
                  ...(index === Object.values(WeekdayEnum).length - 1 && {
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  }),
                }}
                onClick={() => handleWeekdayClick(weekday)}
              >
                {weekday.substring(0, 3)}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={4} display="flex" alignItems="center">
          <Typography fontWeight="bold">Available Dates</Typography>
          <Tooltip title="Specify specific dates when the item is available for lending. This can be useful for indicating availability during holidays or special occasions.">
            <HelpOutlineIcon
              fontSize="small"
              sx={{ marginLeft: '4px', color: 'grey' }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12} md={8} container rowSpacing={2}>
          {whitelist.map((availability, index) => (
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="center"
              alignItems="center"
              key={availability ? availability[0].toDateString() : index}
            >
              <DateRangePicker
                key={availability ? availability[0].toDateString() : index}
                value={availability}
                onChange={value => handleWhitelistChange(index, value)}
                placeholder="Select available dates"
                character=" – "
                ranges={ranges as RangeType[]}
                showOneCalendar
                shouldDisableDate={beforeToday ? beforeToday() : undefined}
              />
            </Grid>
          ))}
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Button
              onClick={addAvailability}
              variant="contained"
              color="success"
            >
              <Typography>Add availability</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={4} display="flex" alignItems="center">
          <Typography fontWeight="bold">Unavailable dates</Typography>
          <Tooltip title="Specify specific dates when the item is not available for lending. This can be useful for indicating periods when you are using the item yourself or undergoing maintenance.">
            <HelpOutlineIcon
              fontSize="small"
              sx={{ marginLeft: '4px', color: 'grey' }}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12} md={8} container rowSpacing={2}>
          {blacklist.map((unavailability, index) => (
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="center"
              alignItems="center"
              key={unavailability ? unavailability[0].toDateString() : index}
            >
              <DateRangePicker
                key={unavailability ? unavailability[0].toDateString() : index}
                value={unavailability}
                onChange={value => handleBlacklistChange(index, value)}
                placeholder="Select unavailable dates"
                character=" – "
                ranges={ranges as RangeType[]}
                showOneCalendar
                shouldDisableDate={beforeToday ? beforeToday() : undefined}
              />
            </Grid>
          ))}
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Button
              onClick={addUnavailability}
              variant="contained"
              color="error"
            >
              <Typography>Add unavailability</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
