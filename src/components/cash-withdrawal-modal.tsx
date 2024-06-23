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
  useToast,
} from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";
type WithdrawalData = {
  transactionMethod: string;
  amount: number;
};
const CashWithdrawalModal = ({
  isOpen,
  onOpen,
  onClose,
  eventName,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  eventName: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WithdrawalData>();
  const toast = useToast();
  const fileWithdrawalMutation =
    trpc.events.eventRevenueWithdrawal.useMutation();
  const onSubmit: SubmitHandler<WithdrawalData> = async (data) => {
    console.log(data);
    fileWithdrawalMutation
      .mutateAsync({
        amount: data?.amount,
        eventName: eventName,
        transactionMethod: data?.transactionMethod,
      })
      .then((data) => {
        if (data?.status == "Withdrawal request filed") {
          toast({ status: "success", description: data?.status });
          onClose();
        } else {
          toast({ status: "error", description: data?.status });
        }
      });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-control m-4">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cash Withdrawal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl
              className="mb-6"
              isInvalid={Boolean(errors.transactionMethod)}
            >
              <FormLabel className="font-bold text-black" htmlFor="name">
                Transaction Method
              </FormLabel>
              <Select
                className="w-full"
                placeholder="Mpesa"
                {...register("transactionMethod", {
                  required: "name is required",
                })}
              >
                <option value="mpesa">Mpesa</option>
              </Select>
              <FormErrorMessage>
                {errors?.transactionMethod?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl className="mb-6" isInvalid={Boolean(errors.amount)}>
              <FormLabel className="fonr-bold text-black">Amount</FormLabel>
              <Input
                type="number"
                {...register("amount", { required: true, valueAsNumber: true })}
              />
              <FormErrorMessage>{errors?.amount?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              isLoading={fileWithdrawalMutation?.isLoading}
              colorScheme="green"
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </form>
  );
};
export default CashWithdrawalModal;
