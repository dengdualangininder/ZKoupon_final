import { Button, Container, Flex, Box, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Box bg="black" minH="100vh" color="white" display="flex" alignItems="center" justifyContent="center">
      <Flex direction="column" align="center" gap={8}>
        <Text
          fontSize="6xl"
          fontWeight="light"
          fontFamily="serif"
          letterSpacing="wider"
        >
          ZKoupon
        </Text>
        
        <Link href="/menu">
          <Button
            size="lg"
            bg="gray.200"
            color="black"
            _hover={{ bg: "gray.300" }}
            borderRadius="full"
            px={8}
            fontSize="xl"
          >
            LAUNCH APP
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}
