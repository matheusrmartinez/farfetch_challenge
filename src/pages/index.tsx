import 'react-datepicker/dist/react-datepicker.css';

import {
  Text,
  HStack,
  Input,
  Image,
  Box,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Button,
  Grid,
  useBreakpointValue
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import DatePicker from 'react-datepicker';
import { api } from '../services/api';
import { getYear, parseISO } from 'date-fns';
import ClipLoader from 'react-spinners/ClipLoader';
import LaunchCard from '../components/LaunchCard';
import { parseCookies } from 'nookies';
import { cloneDeep } from 'lodash';

interface LaunchesData {
  docs: {
    links: {
      patch: {
        small: string;
        alt: string;
      };
    };
    rocket: string;
    rocket_name: string;
    success: boolean;
    flight_number: number;
    name: string;
    date_utc: string;
    year: number;
    id: string;
  }[];
  hasNextPage: boolean;
}
export interface SelectedIcon {
  flightId: string;
  color: string;
}

export default function Home() {
  const [comboBoxPastSelectedValue, setComboBoxPastSelectedValue] =
    useState('');
  const [comboBoxUpComingSelectedValue, setComboBoxUpComingSelectedValue] =
    useState('');
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState('#ffffff');
  const [pastLaunchesData, setPastLaunchesData] = useState<LaunchesData[]>(
    [] as LaunchesData[],
  );
  const [upComingLaunchesData, setUpcomingLaunchesData] = useState<
    LaunchesData[]
  >([] as LaunchesData[]);
  const [favoriteLaunchesData, setFavoriteLaunchesData] = useState<
    LaunchesData[]
  >([] as LaunchesData[]);
  const [allLaunchesData, setAllLaunchesData] = useState<LaunchesData[]>(
    [] as LaunchesData[],
  );
  const [pastStartDate, setPastStartDate] = useState<Date>();
  const [pastLastDate, setPastLastDate] = useState<Date>();
  const [upComingStartDate, setUpComingStartDate] = useState<Date>();
  const [upComingLastDate, setUpComingLastDate] = useState<Date>();
  const [isAppyFilterButtonPressed, setIsAppyFilterButtonPressed] =
    useState(false);
  const [isClearFilterButtonPressed, setIsClearFilterButtonPressed] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBottomPageReached, setIsBottomPageReached] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const pastOffSet = useRef(0);
  const upComingOffSet = useRef(0);
  
  const isWideVersion = useBreakpointValue({
    lg: true,
    base: false
  });

  const [selectedIcons, setSelectedIcons] = useState(() => {
    {
      const cookies = parseCookies();

      return (
        Object.keys(cookies)?.map(key => {
          return {
            flightId: key,
            color: 'yellow.300',
          };
        }) || []
      );
    }
  });

  useEffect(() => {

    getPastLaunches();
    getUpcomingLaunches();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    let pastLaunches: LaunchesData[] = cloneDeep(pastLaunchesData);
    let upComingLaunches: LaunchesData[] = cloneDeep(upComingLaunchesData);
    let allData = pastLaunches.concat(upComingLaunches);

    setAllLaunchesData(allData);
  }, [upComingLaunchesData, pastLaunchesData]);

  useEffect(() => {
    if (isBottomPageReached) {
      tabIndex === 0 ? getPastLaunches() : getUpcomingLaunches();
    }
  }, [isBottomPageReached]);

  useEffect(() => {
    if (isAppyFilterButtonPressed || isClearFilterButtonPressed) {
      tabIndex === 0 ? getPastLaunches() : getUpcomingLaunches();
    }
  }, [isAppyFilterButtonPressed, isClearFilterButtonPressed]);

  useEffect(() => {
    if (!allLaunchesData || allLaunchesData.length === 0 || favoriteLaunchesData.length > 0) return;
    const cookies = parseCookies();
    const keys = Object.keys(cookies);

    let favorite: LaunchesData = { docs: [], hasNextPage: false };

    keys?.forEach(key => {
      allLaunchesData.forEach(launch => {
        favorite.docs.push(launch.docs?.find(doc => doc?.id === key));
      });
    });

    setFavoriteLaunchesData([favorite]);
  }, [allLaunchesData]);

  const handleMissionStatusValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    tabIndex === 0
      ? setComboBoxPastSelectedValue(event.target.value)
      : setComboBoxUpComingSelectedValue(event.target.value);
  };

  async function getRocketName(launches: LaunchesData) {
    if (!launches) return;

    for await (let launch of launches.docs) {
      const response = await api.get(`/rockets/${launch.rocket}`);
      const { name } = response.data;
      launch.rocket_name = name;
    }
    return launches;
  }

  async function getPastLaunches() {
    let launches: LaunchesData = {} as LaunchesData;

    const params = {
      query: getQueryParams(true),
      options: {
        select: 'flight_number rocket success date_utc name links id ',
        limit: 4,
        offset: pastOffSet.current,
      },
    };

    const response = await api.post(`/launches/query`, params);
    launches = response.data;

    const launchesUpdated = await getRocketName(launches);

    let launchesFormatted = {
      docs: launchesUpdated.docs.map(launch => {
        return {
          ...launch,
          alt: `${launch.name} logo`,
          year: getYear(parseISO(launch.date_utc)),
        };
      }),
      hasNextPage: launches.hasNextPage,
    } as LaunchesData;

    setPastLaunchesData([...pastLaunchesData, launchesFormatted]);
    setIsLoading(false);
    setIsAppyFilterButtonPressed(false);
    setIsClearFilterButtonPressed(false);
    pastOffSet.current += 4;
  }

  async function getUpcomingLaunches() {
    let launches: LaunchesData;

    const params = {
      query: getQueryParams(false),
      options: {
        select: 'flight_number rocket success date_utc name links id ',
        limit: 4,
        offset: upComingOffSet.current,
      },
    };

    const response = await api.post(`/launches/query`, params);

    launches = response.data;

    const launchesUpdated = await getRocketName(launches);

    let launchesFormatted = {
      docs: launchesUpdated.docs.map(launch => {
        return {
          ...launch,
          alt: `${launch.name} logo`,
          year: getYear(parseISO(launch.date_utc)),
        };
      }),
      hasNextPage: launches.hasNextPage,
    } as LaunchesData;

    setUpcomingLaunchesData([...upComingLaunchesData, launchesFormatted]);
    setIsLoading(false);
    setIsAppyFilterButtonPressed(false);
    setIsClearFilterButtonPressed(false);
    upComingOffSet.current += 4;
  }

  const handleScroll = () => {
    setIsBottomPageReached(
      Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight,
    );
  };

  function getQueryParams(isPastLaunch: boolean) {
    let params: object = {};

    params = {
      ...{ ...params, upcoming: !isPastLaunch },
      ...(pastStartDate &&
        pastLastDate && {
          ...params,
          date_utc: { $gte: pastStartDate, $lte: pastLastDate },
        }),
      ...(pastStartDate &&
        !pastLastDate && { ...params, date_utc: { $gte: pastStartDate } }),
      ...(!pastStartDate &&
        pastLastDate && { ...params, date_utc: { $lte: pastLastDate } }),
      ...(comboBoxPastSelectedValue === '1' && { ...params, success: true }),
      ...(comboBoxPastSelectedValue === '2' && { ...params, success: false }),
    };

    return params;
  }

  const clearFilters = () => {
    if (tabIndex === 0) {
      setPastStartDate(null);
      setPastLastDate(null);
      setComboBoxPastSelectedValue('');
    } else {
      setUpComingStartDate(null);
      setUpComingLastDate(null);
      setComboBoxUpComingSelectedValue('');
    }
  };

  function isIconSelected(flightId: string) {
    const cookies = parseCookies();
    return Object.keys(cookies).some(key => key === flightId);
  }

  const getIconColor = (docId: string) => {
    let iconIndex = selectedIcons.findIndex(icon => icon.flightId === docId);
    return selectedIcons[iconIndex]?.color ?? 'gray.300';
  };

  return (
    <Box>
      <Header />
      <Box mt={5}>
        <Tabs
          onChange={index => setTabIndex(index)}
          align="center"
          variant="soft-rounded"
          size={'lg'}
        >
          <TabList>
            <Tab>Past</Tab>
            <Tab>Upcoming</Tab>
            <Tab>Favorites</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box pl={6} mt={6}>
                <Text fontSize={'16px'}>Filters</Text>
              </Box>
              {isWideVersion ? (
              <HStack width={'64.1%'} paddingX={6} mt={2}>
                <DatePicker
                  placeholderText="From"
                  customInput={<Input />}
                  selected={pastStartDate}
                  onChange={date => setPastStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={pastLastDate}
                  onChange={date => setPastLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxPastSelectedValue}
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
                      pastOffSet.current = 0;
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
                      pastOffSet.current = 0;
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
                    Clear
                  </Button>
                </HStack>
              </HStack>
              ) : (
                <VStack width={'90%'} paddingX={6} mt={2}>
                <DatePicker
                  placeholderText="From"
                  customInput={<Input />}
                  selected={pastStartDate}
                  onChange={date => setPastStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={pastLastDate}
                  onChange={date => setPastLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxPastSelectedValue}
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
                      pastOffSet.current = 0;
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
                      pastOffSet.current = 0;
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
                    Clear
                  </Button>
                </HStack>
              </VStack>
              )}
              <Box width="66.25%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  mx={10}
                >
                  {pastLaunchesData?.map(launch =>
                    launch?.docs?.map(docs => (
                      <LaunchCard
                        key={docs?.id}
                        isIconSelected={isIconSelected}
                        getIconColor={getIconColor}
                        setSelectedIcons={setSelectedIcons}
                        selectedIcons={selectedIcons}
                        docs={docs}
                      />
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box pl={6} mt={6}>
                <Text fontSize={'16px'}>Filters</Text>
              </Box>
              <Box flexDirection={['column', 'row']}  width={'70%'} paddingX={6} mt={2}>
                <DatePicker
                  placeholderText="From"
                  customInput={<Input />}
                  selected={upComingStartDate}
                  onChange={date => setUpComingStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={upComingLastDate}
                  onChange={date => setUpComingLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxUpComingSelectedValue}
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
                      setUpcomingLaunchesData([]);
                      upComingOffSet.current = 0;
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
                      setUpcomingLaunchesData([]);
                      clearFilters();
                      upComingOffSet.current = 0;
                      getUpcomingLaunches();
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
                    Clear
                  </Button>
                </HStack>
              </Box>
              <Box width="66.5%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  {upComingLaunchesData?.map(launch =>
                    launch?.docs?.map(docs => (
                      <LaunchCard
                        key={docs?.id}
                        isIconSelected={isIconSelected}
                        getIconColor={getIconColor}
                        setSelectedIcons={setSelectedIcons}
                        selectedIcons={selectedIcons}
                        docs={docs}
                      />
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box width="66.5%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  {favoriteLaunchesData?.map(launch =>
                    launch?.docs?.map(docs => (
                      <LaunchCard
                        key={docs?.id}
                        isIconSelected={isIconSelected}
                        getIconColor={getIconColor}
                        setSelectedIcons={setSelectedIcons}
                        selectedIcons={selectedIcons}
                        docs={docs}
                      />
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <ClipLoader color={color} loading={loading} size={150} />
    </Box>
  );
}
