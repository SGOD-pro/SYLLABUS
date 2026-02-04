import { Injectable } from "@nestjs/common";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
    constructor(private readonly config: ConfigService) { }

    createMongooseOptions(): MongooseModuleOptions {
        return {
            uri: this.config.get<string>("MONGO_URI"),
        };
    }
}
