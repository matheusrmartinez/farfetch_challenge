import { Box, HStack, Text, Input, Select, Button, Stack } from '@chakra-ui/react';
import { MutableRefObject } from 'react';
import DatePicker from 'react-datepicker';

interface FiltersProps {
  fromSelectedDate: Date;
  toSelectedDate: Date;
  setFromSelectedDate: (value: Date) => void;
  setToSelectedDate: (value: Date) => void;
  comboBoxSelectedValue: string;
  handleMissionStatusValue: (value: React.ChangeEvent<HTMLSelectElement>) => void;
  setIsLoading: (value: boolean) => void;
  isLoading: boolean;
  setIsAppyFilterButtonPressed: (value: boolean) => void;
  setIsClearFilterButtonPressed: (value: boolean) => void;
  setLaunchesData: (value: []) => void;
  clearFilters: () => void;
  offSet: MutableRefObject<number>;
}

export default function Filters({
  fromSelectedDate,
  toSelectedDate,
  setFromSelectedDate,
  setToSelectedDate,
  comboBoxSelectedValue,
  handleMissionStatusValue,
  isLoading,
  setIsLoading,
  setIsAppyFilterButtonPressed,
  setIsClearFilterButtonPressed,
  setLaunchesData: setPastLaunchesData,
  clearFilters,
  offSet
}: FiltersProps) {
  return (
    <>
      <Box pl={6} mt={6}>
        <Text fontSize={'16px'}>Filters</Text>
      </Box>
      <Stack direction={['column', 'row']} width={["64.1%, 90%"]} paddingX={6} mt={2}>
        <DatePicker
          placeholderText="From"
          customInput={<Input />}
          selected={fromSelectedDate}
          onChange={date => setFromSelectedDate(date)}
        />
        <DatePicker
          placeholderText="To"
          customInput={<Input />}
          selected={toSelectedDate}
          onChange={date => setToSelectedDate(date)}
        />
        <Select
          size={'md'}
          value={comboBoxSelectedValue}
          onChange={event => {
            handleMissionStatusValue(event);
          }}
          placeholder="Select a mission status"
        >
          <option value={'1'}>Successful</option>
          <option value={'2'}>Failed</option>
          <option value={'3'}>All</option>
        </Select>
        <HStack>
          <Button
            onClick={() => {
              setIsLoading(true);
              setIsAppyFilterButtonPressed(true);
              setPastLaunchesData([]);
              offSet.current = 0;
            }}
            isLoading={isLoading}
            colorScheme="blue"
          >
            Apply
          </Button>
          <Button
            onClick={() => {
              setIsLoading(true);
              setIsClearFilterButtonPressed(true);
              setPastLaunchesData([]);
              clearFilters();
              offSet.current = 0;
            }}
            isLoading={isLoading}
            colorScheme="blue"
          >
            Clear
          </Button>
        </HStack>
      </Stack>
    </>
  );
}
