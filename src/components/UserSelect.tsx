import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { UserI } from "../types";
import "react-toastify/dist/ReactToastify.css";

function UserSelect() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleOpen = () => setOpen((open) => !open);
  const toggleLoading = () => setLoading((loading) => !loading);

  const first_name = window.sessionStorage.getItem("first_name");
  const last_name = window.sessionStorage.getItem("last_name");
  let default_name: string | null = first_name + " " + last_name;
  if (first_name === null || last_name === null) {
    default_name = null;
  }
  const [name, setName] = useState<string | null>(default_name);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  function loginOrCreate(first_name: string, last_name: string) {
    axios
      .get(`${BASE_URL}/login`)
      .then((res) => {
        const users: UserI[] = res.data;
        const prev_user_id = window.sessionStorage.getItem("user_id");
        const prev_first_name = window.sessionStorage.getItem("first_name");
        const prev_last_name = window.sessionStorage.getItem("last_name");

        if (prev_first_name == first_name && prev_last_name == last_name) {
          setName(first_name + " " + last_name);
          toast.info(
            "You are already logged into " + first_name + "'s account.",
            { position: "bottom-left" },
          );
          return;
        }

        users.forEach((user) => {
          if (user.first_name == first_name && user.last_name == last_name) {
            window.sessionStorage.setItem("first_name", user.first_name);
            window.sessionStorage.setItem("last_name", user.last_name);
            window.sessionStorage.setItem("user_id", user._id);
          }
        });

        const user_id: string | null = window.sessionStorage.getItem("user_id");
        if (user_id !== prev_user_id) {
          toast.success("Welcome back " + first_name, {
            position: "bottom-left",
          });
          setName(first_name + " " + last_name);

          return;
        }
        const data = { first_name: first_name, last_name: last_name };
        axios
          .post(`${BASE_URL}/login`, data)
          .then((res) => {
            const new_user: UserI = res.data;
            window.sessionStorage.setItem("first_name", new_user.first_name);
            window.sessionStorage.setItem("last_name", new_user.last_name);
            window.sessionStorage.setItem("user_id", new_user._id);
            setName(first_name + " " + last_name);
            toast.success("Welcome back " + first_name, {
              position: "bottom-left",
            });
          })
          .catch((error) => {
            console.log(error);
            toast.error("Failed to create new user.", {
              position: "bottom-left",
            });
          });
      })
      .catch(() => {
        toast.error("Failed to log in.", {
          position: "bottom-left",
        });
      });
  }

  return (
    <>
      {name === null ? (
        <Button onClick={toggleOpen} variant="contained">
          {loading ? "logging in..." : "Select User"}
        </Button>
      ) : (
        <div className="flex flex-col justify-around text-right leading-none">
          <p className="">{name}</p>
          <a className="underline" onClick={toggleOpen}>
            Switch User
          </a>
        </div>
      )}
      <Dialog
        open={open}
        onClose={toggleOpen}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            toggleLoading();
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const first_name = formJson.first_name.toString();
            const last_name = formJson.last_name.toString();

            loginOrCreate(first_name, last_name);

            toggleLoading();
            toggleOpen();
          },
        }}
      >
        <DialogTitle>User Select</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create new user or enter details of already created user.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            name="first_name"
            label="First Name"
            type="name"
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            name="last_name"
            label="Last Name"
            type="name"
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit">Continue</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </>
  );
}

export default UserSelect;
