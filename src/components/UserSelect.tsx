import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { UserI } from "../types";

function UserSelect() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const toggleOpen = () => setOpen((open) => !open)
    const toggleLoading = () => setLoading((loading) => !loading)

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    function loginOrCreate(first_name: string, last_name: string) {
        axios
            .get(`${BASE_URL}/login`)
            .then((res) => {
                const users: UserI[] = res.data
                const prev_user_id = window.sessionStorage.getItem("user_id")

                users.forEach((user) => {
                    if (user.first_name == first_name && user.last_name == last_name) {
                        window.sessionStorage.setItem("first_name", user.first_name)
                        window.sessionStorage.setItem("last_name", user.last_name)
                        window.sessionStorage.setItem("user_id", user._id)
                    }
                })

                const user_id: string | null = window.sessionStorage.getItem("user_id")
                if (user_id !== prev_user_id) {
                    // TODO Toast Welcome Back
                    return
                }
                const data = { first_name: first_name, last_name: last_name }
                axios
                    .post(`${BASE_URL}/login`, data)
                    .then((res) => {
                        const new_user: UserI = res.data
                        window.sessionStorage.setItem("first_name", new_user.first_name)
                        window.sessionStorage.setItem("last_name", new_user.last_name)
                        window.sessionStorage.setItem("user_id", new_user._id)
                        // TODO Toast Created New User
                    })
                    .catch((error) => {
                        console.log(error)
                        // TODO Toast report error 
                    })
            }).catch((error) => {
                console.log("here")
                console.log(error);
                //TODO toast report error
            })
    }

    return <>
        <Button onClick={toggleOpen} variant="contained">
            {loading ? "logging in..." : "Select User"}
        </Button>
        <Dialog
            open={open}
            onClose={toggleOpen}
            PaperProps={{
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    toggleLoading()
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries(formData.entries());
                    const first_name = formJson.first_name.toString();
                    const last_name = formJson.last_name.toString();

                    loginOrCreate(first_name, last_name)

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
    </>
}

export default UserSelect;
