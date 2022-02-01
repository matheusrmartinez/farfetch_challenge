import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Link,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';

import { api } from '../services/api';
import { getYear, parseISO } from 'date-fns';
import LaunchCard from '../components/LaunchCard';
import { parseCookies } from 'nookies';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { ThreeDots } from 'react-loader-spinner';
import Filters from '../components/Filters';
import 'react-datepicker/dist/react-datepicker.css';
import { Doc, LaunchesData } from '../types';

export default function Home() {
  const [comboBoxPastSelectedValue, setComboBoxPastSelectedValue] =
    useState('');
  const [comboBoxUpComingSelectedValue, setComboBoxUpComingSelectedValue] =
    useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pastLaunchesData, setPastLaunchesData] = useState<LaunchesData[]>(
    [] as LaunchesData[],
  );
  const [upComingLaunchesData, setUpcomingLaunchesData] = useState<
    LaunchesData[]
  >([] as LaunchesData[]);
  const [favoriteLaunchesData, setFavoriteLaunchesData] = useState<
    LaunchesData[]
  >([] as LaunchesData[]);
  const [favoriteLauncheData, setFavoriteLauncheData] = useState<Doc[]>(
    [] as Doc[],
  );
  const [allLaunchesData, setAllLaunchesData] = useState<LaunchesData[]>(
    [] as LaunchesData[],
  );
  const [fromPastDate, setFromPastDate] = useState<Date>();
  const [toPastDate, setToPastDate] = useState<Date>();
  const [fromUpComingDate, setFromUpComingDate] = useState<Date>();
  const [toUpComingDate, setToUpComingDate] = useState<Date>();
  const [isAppyFilterButtonPressed, setIsAppyFilterButtonPressed] =
    useState(false);
  const [isClearFilterButtonPressed, setIsClearFilterButtonPressed] =
    useState(false);
  const [isPageBottomReached, setIsPageBottomReached] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const pastOffSet = useRef(0);
  const upComingOffSet = useRef(0);
  const [scrollPosition, setScrollPosition] = useState(0);
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
    getLaunches(true);
    getLaunches(false);
    getFavoriteLaunches();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isFavoriteTab()) return;
    let hasNextPage = false;

    if (isPageBottomReached && isPastTab()) {
      hasNextPage =
        pastLaunchesData[pastLaunchesData.length - 1]?.hasNextPage ?? false;

      if (hasNextPage) getLaunches(isPastTab());
    } else if (isPageBottomReached && !isPastTab()) {
      hasNextPage =
        upComingLaunchesData[upComingLaunchesData.length - 1]?.hasNextPage ??
        false;

      if (hasNextPage) getLaunches(isPastTab());
    }
  }, [isPageBottomReached]);

  useEffect(() => {
    if (isAppyFilterButtonPressed || isClearFilterButtonPressed) {
      getLaunches(isPastTab());
    }
  }, [isAppyFilterButtonPressed, isClearFilterButtonPressed]);

  useEffect(() => {
    if (
      !allLaunchesData ||
      allLaunchesData.length === 0 ||
      favoriteLaunchesData.length > 0
    )
      return;
    const cookies = parseCookies();
    const keys = Object.keys(cookies);

    let favorites: Doc[] = [];

    keys?.forEach(key => {
      allLaunchesData.forEach(launch => {
        const doc = launch.docs.find(doc => doc.id === key);

        if (!doc) return;

        favorites.push(doc);
      });
    });

    setFavoriteLauncheData(favorites);
  }, [allLaunchesData]);

  const handleMissionStatusValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    isPastTab()
      ? setComboBoxPastSelectedValue(event.target.value)
      : setComboBoxUpComingSelectedValue(event.target.value);
  };

  async function getAllRocketNames(launches: LaunchesData) {
    if (!launches) return;

    for await (let launch of launches.docs) {
      const response = await api.get(`/rockets/${launch.rocket}`);
      const { name } = response.data;
      launch.rocket_name = name;
    }
    return launches;
  }

  async function getRocketName(doc: Doc) {
    if (!doc) return;

    const response = await api.get(`/rockets/${doc.rocket}`);
    const { name } = response.data;
    doc.rocket_name = name;
    return doc;
  }

  async function getLaunches(isPastLaunch: boolean) {
    setIsLoading(true);
    let launches: LaunchesData;

    const params = {
      query: isPastLaunch ? getPastQueryParams() : getUpComingQueryParams(),
      options: {
        select: 'flight_number rocket success date_utc name links id ',
        limit: 4,
        offset: isPastLaunch ? pastOffSet.current : upComingOffSet.current,
      },
    };

    const response = await api.post(`/launches/query`, params);

    launches = response.data;

    console.log(launches, 'lançamentos')

    const launchesUpdated = await getAllRocketNames(launches);

    setIsLoading(false);

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

    if (isPastLaunch) {
      setPastLaunchesData([...pastLaunchesData, launchesFormatted]);
      pastOffSet.current += 4;
    } else {
      setUpcomingLaunchesData([...upComingLaunchesData, launchesFormatted]);
      upComingOffSet.current += 4;
    }
    setIsLoading(false);
    setIsAppyFilterButtonPressed(false);
    setIsClearFilterButtonPressed(false);
  }

  async function getFavoriteLaunches() {
    setIsLoading(true);

    let doc: Doc;
    let favorites: Doc[] = [];
    let docUpdated: Doc;

    const cookies = parseCookies();
    const keys = Object.keys(cookies);

    for await (let key of keys) {
      const response = await api.get(`/launches/${key}`);

      doc = response.data;

      docUpdated = await getRocketName(doc);

      docUpdated.links.patch.alt = `${docUpdated.name} logo`;
      docUpdated.year = getYear(parseISO(doc.date_utc));
      favorites.push(docUpdated);
    }

    setIsLoading(false);
    setFavoriteLauncheData(favorites);
  }

  const handleScroll = () => {
    setIsPageBottomReached(
      Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight,
    );

    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  function getPastQueryParams() {
    let params: object = {};

    params = {
      ...{ ...params, upcoming: false },
      ...(fromPastDate &&
        toPastDate && {
          ...params,
          date_utc: { $gte: fromPastDate, $lte: toPastDate },
        }),
      ...(fromPastDate &&
        !toPastDate && { ...params, date_utc: { $gte: fromPastDate } }),
      ...(!fromPastDate &&
        toPastDate && { ...params, date_utc: { $lte: toPastDate } }),
      ...(comboBoxPastSelectedValue === '1' && { ...params, success: true }),
      ...(comboBoxPastSelectedValue === '2' && { ...params, success: false }),
    };

    return params;
  }

  function getUpComingQueryParams() {
    let params: object = {};

    params = {
      ...{ ...params, upcoming: true },
      ...(fromUpComingDate &&
        toUpComingDate && {
          ...params,
          date_utc: { $gte: fromUpComingDate, $lte: toUpComingDate },
        }),
      ...(fromUpComingDate &&
        !toUpComingDate && { ...params, date_utc: { $gte: fromUpComingDate } }),
      ...(!fromUpComingDate &&
        toUpComingDate && { ...params, date_utc: { $lte: toUpComingDate } }),
      ...(comboBoxUpComingSelectedValue === '1' && {
        ...params,
        success: true,
      }),
      ...(comboBoxUpComingSelectedValue === '2' && {
        ...params,
        success: false,
      }),
    };

    return params;
  }

  const clearFilters = () => {
    if (isPastTab()) {
      setFromPastDate(null);
      setToPastDate(null);
      setComboBoxPastSelectedValue('');
    } else {
      setFromUpComingDate(null);
      setToUpComingDate(null);
      setComboBoxUpComingSelectedValue('');
    }
  };

  function isIconSelected(flightId: string) {
    return favoriteLauncheData.some(key => key.id === flightId);
  }

  const getIconColor = (docId: string) => {
    let iconIndex = selectedIcons.findIndex(icon => icon.flightId === docId);
    return selectedIcons[iconIndex]?.color ?? 'gray.300';
  };

  const handleAddFavoriteData = (value: Doc) => {
    setFavoriteLauncheData([...favoriteLauncheData, value]);
  };

  const handleRemoveFavoriteData = (flightId: string) => {
    let favoriteLaunches = favoriteLauncheData.filter(
      doc => doc.id !== flightId,
    );
    setFavoriteLauncheData(favoriteLaunches);
  };

  const Spinner = () =>
    isLoading && (
      <Link href="/#top">
        <Box
          position="fixed"
          bottom="20px"
          right={['16px', '730px']}
          zIndex={1}
          justifyContent="center"
          flex={1}
          size="md"
        >
          <ThreeDots color="black" visible={isLoading} />
        </Box>
      </Link>
    );

  const isPastTab = () => {
    return tabIndex === 0;
  };

  const isFavoriteTab = () => {
    return tabIndex === 2;
  };

  const ButtonScrollToTheTop = () =>
    scrollPosition > 500 && (
      <Link href="/#top">
        <Box position="fixed" bottom="20px" right={['16px', '84px']} zIndex={1}>
          <IconButton
            aria-label="Search database"
            color="black"
            icon={<ArrowUpIcon />}
          />
        </Box>
      </Link>
    );

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
              <Filters
                fromSelectedDate={fromPastDate}
                setFromSelectedDate={setFromPastDate}
                toSelectedDate={toPastDate}
                setToSelectedDate={setToPastDate}
                comboBoxSelectedValue={comboBoxPastSelectedValue}
                handleMissionStatusValue={handleMissionStatusValue}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setIsAppyFilterButtonPressed={setIsAppyFilterButtonPressed}
                setIsClearFilterButtonPressed={setIsClearFilterButtonPressed}
                setLaunchesData={setPastLaunchesData}
                clearFilters={clearFilters}
                offSet={pastOffSet}
              />
              <Box width="66.25%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  mx={10}
                  mb={200}
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
                        handleAddFavoriteData={handleAddFavoriteData}
                        handleRemoveFavoriteData={handleRemoveFavoriteData}
                      />
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
            <TabPanel>
              <Filters
                fromSelectedDate={fromUpComingDate}
                setFromSelectedDate={setFromUpComingDate}
                toSelectedDate={toUpComingDate}
                setToSelectedDate={setToUpComingDate}
                comboBoxSelectedValue={comboBoxUpComingSelectedValue}
                handleMissionStatusValue={handleMissionStatusValue}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setIsAppyFilterButtonPressed={setIsAppyFilterButtonPressed}
                setIsClearFilterButtonPressed={setIsClearFilterButtonPressed}
                setLaunchesData={setUpcomingLaunchesData}
                clearFilters={clearFilters}
                offSet={upComingOffSet}
              />
              <Box width="66.25%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  mx={10}
                  mb={200}
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
                        handleAddFavoriteData={handleAddFavoriteData}
                        handleRemoveFavoriteData={handleRemoveFavoriteData}
                      />
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box width="66.25%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  mx={10}
                  mb={200}
                >
                  {favoriteLauncheData?.map(launch => (
                    <LaunchCard
                      key={launch?.id}
                      isIconSelected={isIconSelected}
                      getIconColor={getIconColor}
                      setSelectedIcons={setSelectedIcons}
                      selectedIcons={selectedIcons}
                      docs={launch}
                      handleAddFavoriteData={handleAddFavoriteData}
                      handleRemoveFavoriteData={handleRemoveFavoriteData}
                    />
                  ))}
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <Spinner />
      <ButtonScrollToTheTop />
    </Box>
  );
}
