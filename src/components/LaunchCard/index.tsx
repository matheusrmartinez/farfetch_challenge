import { StarIcon } from '@chakra-ui/icons';
import {
  Box,
  IconButton,
  Image,
  VStack,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import nookies from 'nookies';
import { Doc, SelectedIcon } from '../../types';

interface LaunchCardProps {
  docs: Doc;
  isIconSelected: (value: string) => boolean;
  getIconColor: (value: string) => string;
  setSelectedIcons: (value: { flightId: string; color: string }[]) => void;
  selectedIcons: SelectedIcon[];
  handleAddFavoriteData: (value: Doc) => void;
  handleRemoveFavoriteData: (value: string) => void;
}

export default function LaunchCard({
  docs,
  isIconSelected,
  getIconColor,
  setSelectedIcons,
  selectedIcons,
  handleRemoveFavoriteData,
  handleAddFavoriteData,
}: LaunchCardProps) {
  return (
    <Box
      key={docs?.id}
      display="flex"
      flexDirection={'row'}
      maxW="md"
      borderWidth="1px"
      borderRadius="lg"
      alignItems="center"
      justifyContent="center"
      spacing={6}
      p={4}
    >
      <VStack mr={[1, 10]} justifyContent="center" alignItems="center">
        <Image
          src={docs?.links?.patch?.small}
          alt={docs?.links?.patch?.alt}
          p={2}
          boxSize="125px"
          mr={8}
        />
        <HStack>
          <Badge
            borderRadius="full"
            px="3"
            mr={docs?.success === null ? 8 : 0}
            py={0.5}
            colorScheme="green"
          >
            {docs?.year}
          </Badge>
          {docs.success !== null && (
            <Badge
              borderRadius="full"
              px="3"
              py={0.5}
              colorScheme={docs?.success === true ? 'green' : 'red'}
            >
              {docs?.success === true ? 'Successful' : 'Failed'}
            </Badge>
          )}
        </HStack>
      </VStack>
      <VStack w="45%" align="flex-end">
        <Box mt={-5} mb={5}>
          <IconButton
            aria-label="Search database"
            data-testid="star-button"
            size="xs"
            onClick={() => {
              if (isIconSelected(docs?.id)) {
                nookies.destroy(null, docs?.id);
                handleRemoveFavoriteData(docs.id);
                setSelectedIcons(
                  selectedIcons.filter(key => key?.flightId !== docs?.id),
                );
              } else {
                nookies.set(null, docs?.id, docs?.id),
                  handleAddFavoriteData(docs);
                setSelectedIcons([
                  ...selectedIcons,
                  { flightId: docs?.id, color: 'yellow.300' },
                ]);
              }
            }}
            icon={<StarIcon color={getIconColor(docs?.id)} />}
          />
        </Box>
        <Box mt="1" fontWeight="semibold" isTruncated>
          Launch Number: {docs?.flight_number}
        </Box>
        <Text mt="1" noOfLines={2} fontWeight="semibold">
          Mission: {docs?.name.slice(0, 12)}
        </Text>
        <Box mt="1" fontWeight="semibold" isTruncated>
          Rocket: {docs?.rocket_name}
        </Box>
      </VStack>
    </Box>
  );
}
