/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.config;

import com.emergencyconnect.shared.shard.ShardContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class ShardingDataSourceConfig {

    @Value("${shard.datasource.shard0.url}")
    private String shard0Url;

    @Value("${shard.datasource.shard1.url}")
    private String shard1Url;

    @Value("${shard.datasource.shard2.url}")
    private String shard2Url;

    @Value("${shard.datasource.username}")
    private String username;

    @Value("${shard.datasource.password}")
    private String password;

    @Bean
    @Primary
    public DataSource shardingDataSource() {
        DataSource shard0 = buildDataSource(shard0Url);
        DataSource shard1 = buildDataSource(shard1Url);
        DataSource shard2 = buildDataSource(shard2Url);

        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("shard-0", shard0);
        targetDataSources.put("shard-1", shard1);
        targetDataSources.put("shard-2", shard2);

        AbstractRoutingDataSource router = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                return ShardContext.getCurrentShard();
            }
        };

        router.setTargetDataSources(targetDataSources);
        router.setDefaultTargetDataSource(shard0);
        router.afterPropertiesSet();
        return router;
    }

    private DataSource buildDataSource(String url) {
        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();
    }
}
