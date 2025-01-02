import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
type WithdrawalData = {
  transactionMethod: string;
  amount: number;
};
const CashWithdrawalModal = ({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WithdrawalData>();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form className="form-control m-4">
            <FormControl
              className="mb-6"
              isInvalid={Boolean(errors.transactionMethod)}
            >
              <FormLabel className="font-bold text-black" htmlFor="name">
                Method
              </FormLabel>
              <Select
                className="w-full"
                placeholder="Transaction Method"
                {...register("transactionMethod", {
                  required: "method is required",
                })}
              />
              <FormErrorMessage>
                {errors?.transactionMethod?.message}
              </FormErrorMessage>
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost">Secondary Action</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
