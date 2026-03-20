class UserResponseDto {
    constructor(id, username, email, role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role || "user";
    }
}

class CreateUserRequestDto {
    constructor(data) {
        this.username = data.username;
        this.email = data.email;
    }
}

class UpdateUserRequestDto {
    constructor(data) {
        this.username = data.username;
        this.email = data.email;
    }
}

module.exports = { UserResponseDto, CreateUserRequestDto, UpdateUserRequestDto };