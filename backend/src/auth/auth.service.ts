import type { ClerkClient } from "@clerk/backend";
import { Inject, Injectable } from "@nestjs/common";
// import { UserRepository } from "src/users/user.repository";
// import { JwtPayload } from "@clerk/backend/jwt"
import { UserMapper } from "src/users/user.mapper"
import type { JwtPayload } from "@clerk/types";
import { UsersService } from "src/users/user.service";

// function handleJwt(payload: JwtPayload) {
//   const userId = payload.sub;
// }

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UsersService,
    @Inject('CLERK_CLIENT')
    private readonly clerkClient: ClerkClient,
  ) { }

  async getOrCreateUserFromToken(sub: NonNullable<JwtPayload['sub']>) {
    const clerk = await this.clerkClient.users.getUser(sub);
    let user = await this.userRepo.getByClerkId(sub);
    console.log("user ",user)
    console.log("clerk ",clerk)

    
    if (!user) {
      user = await this.userRepo.createIfNotExists({
        clerkId: sub,
        email: clerk.emailAddresses[0].emailAddress,
        name: `${clerk.firstName ?? ''} ${clerk.lastName ?? ''}`.trim(),
        profilePic: clerk.imageUrl,
      });
      const email = clerk.emailAddresses[0].emailAddress.split("@")[1];
      console.log(email)
    }

    // if (email !== "@kiit.ac.in") throw new UnauthorizedException('This is only for KIIT students!');
    return UserMapper.toResponse(user);
  }
}
